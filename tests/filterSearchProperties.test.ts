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
import { fileMatchesFilterTokens, parseFilterSearchTokens, updateFilterQueryWithProperty } from '../src/utils/filterSearch';
import { foldSearchText } from '../src/utils/recordUtils';

describe('filterSearch property tokenization', () => {
    it('keeps quoted property values in one token', () => {
        const tokens = parseFilterSearchTokens('.status="In Progress"');
        expect(tokens.propertyTokens).toEqual([{ key: 'status', value: 'in progress' }]);
        expect(tokens.nameTokens).toEqual([]);
    });

    it('parses quoted property keys with whitespace', () => {
        const tokens = parseFilterSearchTokens('."Reading Status"="In Progress"');
        expect(tokens.propertyTokens).toEqual([{ key: 'reading status', value: 'in progress' }]);
        expect(tokens.nameTokens).toEqual([]);
    });

    it('supports escaped quotes and round-trips query mutation', () => {
        const parsed = parseFilterSearchTokens('.status="He said \\"ok\\""');
        expect(parsed.propertyTokens).toEqual([{ key: 'status', value: 'he said "ok"' }]);

        const added = updateFilterQueryWithProperty('', 'status', 'He said "ok"', 'AND');
        expect(added.query).toBe('.status="he said \\"ok\\""');
        expect(added.action).toBe('added');
        expect(added.changed).toBe(true);

        const removed = updateFilterQueryWithProperty(added.query, 'status', 'He said "ok"', 'AND');
        expect(removed.query).toBe('');
        expect(removed.action).toBe('removed');
        expect(removed.changed).toBe(true);
    });

    it('parses escaped "=" in property keys and values', () => {
        const tokens = parseFilterSearchTokens('."Status\\=Phase"="In\\=Progress"');
        expect(tokens.propertyTokens).toEqual([{ key: 'status=phase', value: 'in=progress' }]);
        expect(tokens.nameTokens).toEqual([]);
    });
});

describe('filterSearch property parsing', () => {
    it('parses include and exclude property tokens in filter mode', () => {
        const includeTokens = parseFilterSearchTokens('.status');
        expect(includeTokens.mode).toBe('tag');
        expect(includeTokens.propertyTokens).toEqual([{ key: 'status', value: null }]);

        const excludeTokens = parseFilterSearchTokens('-.flag=internal');
        expect(excludeTokens.mode).toBe('tag');
        expect(excludeTokens.excludePropertyTokens).toEqual([{ key: 'flag', value: 'internal' }]);
    });

    it('supports expression mode with tag and property operands', () => {
        const tokens = parseFilterSearchTokens('#work AND .status=started');
        expect(tokens.mode).toBe('tag');
        expect(tokens.requiresProperties).toBe(true);
        expect(tokens.expression.length).toBeGreaterThan(0);
    });

    it('treats empty property values as key-only tokens', () => {
        const includeTokens = parseFilterSearchTokens('.hidefeature=');
        expect(includeTokens.propertyTokens).toEqual([{ key: 'hidefeature', value: null }]);

        const excludeTokens = parseFilterSearchTokens('-.hidefeature=');
        expect(excludeTokens.excludePropertyTokens).toEqual([{ key: 'hidefeature', value: null }]);
    });
});

describe('filterSearch property evaluation', () => {
    it('matches key-only and substring value tokens', () => {
        const keyOnlyTokens = parseFilterSearchTokens('.status');
        const valueTokens = parseFilterSearchTokens('.status=work');

        const statusProperties = new Map<string, string[]>([['status', ['work/finished']]]);
        const exactStatusProperties = new Map<string, string[]>([['status', ['work']]]);
        const noProperties = new Map<string, string[]>();

        expect(
            fileMatchesFilterTokens('note', [], keyOnlyTokens, { hasUnfinishedTasks: false, propertyValuesByKey: statusProperties })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('note', [], keyOnlyTokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([['status', []]])
            })
        ).toBe(true);
        expect(fileMatchesFilterTokens('note', [], keyOnlyTokens, { hasUnfinishedTasks: false, propertyValuesByKey: noProperties })).toBe(
            false
        );

        expect(fileMatchesFilterTokens('note', [], valueTokens, { hasUnfinishedTasks: false, propertyValuesByKey: statusProperties })).toBe(
            true
        );
        expect(
            fileMatchesFilterTokens('note', [], valueTokens, { hasUnfinishedTasks: false, propertyValuesByKey: exactStatusProperties })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('note', [], valueTokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([['status', ['done']]])
            })
        ).toBe(false);
    });

    it('prefix-matches key-only filters while keeping value-filter keys exact', () => {
        const keyOnlyTokens = parseFilterSearchTokens('.alias');
        const valueTokens = parseFilterSearchTokens('.alias=best');
        const properties = new Map<string, string[]>([['aliases', ['best note']]]);

        expect(fileMatchesFilterTokens('note', [], keyOnlyTokens, { hasUnfinishedTasks: false, propertyValuesByKey: properties })).toBe(
            true
        );
        expect(fileMatchesFilterTokens('note', [], valueTokens, { hasUnfinishedTasks: false, propertyValuesByKey: properties })).toBe(
            false
        );
    });

    it('matches generated property values by partial author name', () => {
        const fullNameTokens = parseFilterSearchTokens('.author="noam chomsky"');
        const surnameTokens = parseFilterSearchTokens('.author=chomsky');

        const fullNameAuthorProperties = new Map<string, string[]>([['author', [foldSearchText('Avram Noam Chomsky')]]]);
        const etAlAuthorProperties = new Map<string, string[]>([['author', [foldSearchText('Chomsky et al.')]]]);

        expect(
            fileMatchesFilterTokens('note', [], fullNameTokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: fullNameAuthorProperties
            })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('note', [], surnameTokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: etAlAuthorProperties
            })
        ).toBe(true);
    });

    it('excludes files by substring property value tokens', () => {
        const tokens = parseFilterSearchTokens('-.author=chomsky');

        expect(
            fileMatchesFilterTokens('note', [], tokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([['author', [foldSearchText('Avram Noam Chomsky')]]])
            })
        ).toBe(false);
        expect(
            fileMatchesFilterTokens('note', [], tokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([['author', [foldSearchText('Ursula K. Le Guin')]]])
            })
        ).toBe(true);
    });

    it('matches empty property value filters as key-only filters', () => {
        const includeTokens = parseFilterSearchTokens('.hidefeature=');
        const excludeTokens = parseFilterSearchTokens('-.hidefeature=');
        const properties = new Map<string, string[]>([['hidefeature', ['true']]]);

        expect(fileMatchesFilterTokens('note', [], includeTokens, { hasUnfinishedTasks: false, propertyValuesByKey: properties })).toBe(
            true
        );
        expect(fileMatchesFilterTokens('note', [], excludeTokens, { hasUnfinishedTasks: false, propertyValuesByKey: properties })).toBe(
            false
        );
    });

    it('evaluates OR expressions between property tokens', () => {
        const tokens = parseFilterSearchTokens('.status=started OR .status=finished');
        expect(tokens.mode).toBe('tag');

        expect(
            fileMatchesFilterTokens('note', [], tokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([['status', ['started']]])
            })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('note', [], tokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([['status', ['finished']]])
            })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('note', [], tokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([['status', ['paused']]])
            })
        ).toBe(false);
    });

    it('matches folded property keys and values', () => {
        const tokens = parseFilterSearchTokens('.status=accion');
        expect(
            fileMatchesFilterTokens('note', [], tokens, {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map<string, string[]>([[foldSearchText('Státus'), [foldSearchText('Plan de acción')]]])
            })
        ).toBe(true);
    });
});

describe('updateFilterQueryWithProperty', () => {
    it('adds and removes key-only property tokens', () => {
        const added = updateFilterQueryWithProperty('', 'status', null, 'AND');
        expect(added.query).toBe('.status');
        expect(added.action).toBe('added');
        expect(added.changed).toBe(true);

        const removed = updateFilterQueryWithProperty(added.query, 'status', null, 'AND');
        expect(removed.query).toBe('');
        expect(removed.action).toBe('removed');
        expect(removed.changed).toBe(true);
    });

    it('removes property tokens using folded key/value matching', () => {
        const result = updateFilterQueryWithProperty('.Státus=acción AND .phase=done', 'status', 'accion', 'AND');
        expect(result.query).toBe('.phase=done');
        expect(result.action).toBe('removed');
        expect(result.changed).toBe(true);
    });

    it('inserts OR connectors in expression queries', () => {
        const result = updateFilterQueryWithProperty('#work', 'status', 'in progress', 'OR');
        expect(result.query).toBe('#work OR .status="in progress"');
        expect(result.action).toBe('added');
        expect(result.changed).toBe(true);
    });

    it('quotes keys with whitespace in generated query tokens', () => {
        const result = updateFilterQueryWithProperty('', 'Reading Status', 'Acme Corp', 'AND');
        expect(result.query).toBe('."reading status"="acme corp"');
        expect(result.action).toBe('added');
        expect(result.changed).toBe(true);
    });

    it('round-trips keys containing "="', () => {
        const added = updateFilterQueryWithProperty('', 'Status=Phase', null, 'AND');
        expect(added.query).toBe('."status\\=phase"');
        expect(added.action).toBe('added');
        expect(added.changed).toBe(true);

        const parsed = parseFilterSearchTokens(added.query);
        expect(parsed.propertyTokens).toEqual([{ key: 'status=phase', value: null }]);

        const removed = updateFilterQueryWithProperty(added.query, 'Status=Phase', null, 'AND');
        expect(removed.query).toBe('');
        expect(removed.action).toBe('removed');
        expect(removed.changed).toBe(true);
    });

    it('round-trips values containing "="', () => {
        const added = updateFilterQueryWithProperty('', 'status', 'In=Progress', 'AND');
        expect(added.query).toBe('.status="in\\=progress"');
        expect(added.action).toBe('added');
        expect(added.changed).toBe(true);

        const parsed = parseFilterSearchTokens(added.query);
        expect(parsed.propertyTokens).toEqual([{ key: 'status', value: 'in=progress' }]);
    });

    it('round-trips values containing backslashes', () => {
        const added = updateFilterQueryWithProperty('', 'path', 'C:\\Notes\\Daily', 'AND');
        expect(added.query).toBe('.path="c:\\\\notes\\\\daily"');
        expect(added.action).toBe('added');
        expect(added.changed).toBe(true);

        const parsed = parseFilterSearchTokens(added.query);
        expect(parsed.propertyTokens).toEqual([{ key: 'path', value: 'c:\\notes\\daily' }]);
    });

    it('round-trips Markdown-link values through their displayed label', () => {
        const rawValue = '[Project Alpha](https://example.com/projects/alpha)';
        const added = updateFilterQueryWithProperty('', 'reference', rawValue, 'AND');

        expect(added.query).toBe('.reference="project alpha"');
        expect(parseFilterSearchTokens(added.query).propertyTokens).toEqual([{ key: 'reference', value: 'project alpha' }]);
        expect(parseFilterSearchTokens(`.reference="${rawValue}"`).propertyTokens).toEqual([{ key: 'reference', value: 'project alpha' }]);
        expect(
            fileMatchesFilterTokens('note', [], parseFilterSearchTokens(added.query), {
                hasUnfinishedTasks: false,
                propertyValuesByKey: new Map([['reference', ['project alpha']]])
            })
        ).toBe(true);

        const removed = updateFilterQueryWithProperty(added.query, 'reference', rawValue, 'AND');
        expect(removed.query).toBe('');
        expect(removed.action).toBe('removed');
    });

    it('appends tokens without connectors in mixed queries', () => {
        const result = updateFilterQueryWithProperty('meeting @today', 'status', 'in progress', 'OR');
        expect(result.query).toBe('meeting @today .status="in progress"');
        expect(result.action).toBe('added');
        expect(result.changed).toBe(true);
    });
});
