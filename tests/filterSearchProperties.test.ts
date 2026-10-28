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
        expect(tokens.propertyTokens).toEqual([{ key: 'status', match: 'value', value: 'in progress' }]);
        expect(tokens.nameTokens).toEqual([]);
    });

    it('parses quoted property keys with whitespace', () => {
        const tokens = parseFilterSearchTokens('."Reading Status"="In Progress"');
        expect(tokens.propertyTokens).toEqual([{ key: 'reading status', match: 'value', value: 'in progress' }]);
        expect(tokens.nameTokens).toEqual([]);
    });

    it('supports escaped quotes and round-trips query mutation', () => {
        const parsed = parseFilterSearchTokens('.status="He said \\"ok\\""');
        expect(parsed.propertyTokens).toEqual([{ key: 'status', match: 'value', value: 'he said "ok"' }]);

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
        expect(tokens.propertyTokens).toEqual([{ key: 'status=phase', match: 'value', value: 'in=progress' }]);
        expect(tokens.nameTokens).toEqual([]);
    });
});

describe('filterSearch property parsing', () => {
    it('parses include and exclude property tokens in filter mode', () => {
        const includeTokens = parseFilterSearchTokens('.status');
        expect(includeTokens.mode).toBe('tag');
        expect(includeTokens.propertyTokens).toEqual([{ key: 'status', match: 'key' }]);

        const excludeTokens = parseFilterSearchTokens('-.flag=internal');
        expect(excludeTokens.mode).toBe('tag');
        expect(excludeTokens.excludePropertyTokens).toEqual([{ key: 'flag', match: 'value', value: 'internal' }]);
    });

    it('supports expression mode with tag and property operands', () => {
        const tokens = parseFilterSearchTokens('#work AND .status=started');
        expect(tokens.mode).toBe('tag');
        expect(tokens.requiresProperties).toBe(true);
        expect(tokens.expression.length).toBeGreaterThan(0);
    });

    it('treats empty property values as key-only tokens', () => {
        const includeTokens = parseFilterSearchTokens('.hidefeature=');
        expect(includeTokens.propertyTokens).toEqual([{ key: 'hidefeature', match: 'key' }]);

        const excludeTokens = parseFilterSearchTokens('-.hidefeature=');
        expect(excludeTokens.excludePropertyTokens).toEqual([{ key: 'hidefeature', match: 'key' }]);
    });
});

describe('filterSearch empty property values', () => {
    const matches = (query: string, propertyValuesByKey: Map<string, string[]>) =>
        fileMatchesFilterTokens('note', [], parseFilterSearchTokens(query), { hasUnfinishedTasks: false, propertyValuesByKey });
    const emptyLens = new Map<string, string[]>([['lens', []]]);
    const valuedLens = new Map<string, string[]>([['lens', ['wide']]]);
    const missingLens = new Map<string, string[]>();
    const emptyLensPrefix = new Map<string, string[]>([['lens-type', []]]);

    it('parses unquoted null as an empty-value token in any case', () => {
        expect(parseFilterSearchTokens('.lens=null').propertyTokens).toEqual([{ key: 'lens', match: 'empty' }]);
        expect(parseFilterSearchTokens('.Lens=NULL').propertyTokens).toEqual([{ key: 'lens', match: 'empty' }]);
        expect(parseFilterSearchTokens('-.lens=null').excludePropertyTokens).toEqual([{ key: 'lens', match: 'empty' }]);
        expect(parseFilterSearchTokens('."Camera Lens"=null').propertyTokens).toEqual([{ key: 'camera lens', match: 'empty' }]);
    });

    it('keeps quoted null and longer values as literal value tokens', () => {
        expect(parseFilterSearchTokens('.lens="null"').propertyTokens).toEqual([{ key: 'lens', match: 'value', value: 'null' }]);
        expect(parseFilterSearchTokens('-.lens="null"').excludePropertyTokens).toEqual([{ key: 'lens', match: 'value', value: 'null' }]);
        expect(parseFilterSearchTokens('.lens=nullable').propertyTokens).toEqual([{ key: 'lens', match: 'value', value: 'nullable' }]);
    });

    it('keeps key-only and empty-value clauses on the same key apart', () => {
        const tokens = parseFilterSearchTokens('.lens AND .lens=null');
        expect(tokens.mode).toBe('tag');
        expect(tokens.propertyTokens).toEqual([
            { key: 'lens', match: 'key' },
            { key: 'lens', match: 'empty' }
        ]);
    });

    it('matches only an exact key that is present with no value', () => {
        expect(matches('.lens=null', emptyLens)).toBe(true);
        expect(matches('.lens=null', valuedLens)).toBe(false);
        expect(matches('.lens=null', missingLens)).toBe(false);
        expect(matches('.lens=null', emptyLensPrefix)).toBe(false);
    });

    it('excludes only notes where the key is present with no value', () => {
        expect(matches('-.lens=null', emptyLens)).toBe(false);
        expect(matches('-.lens=null', valuedLens)).toBe(true);
        expect(matches('-.lens=null', missingLens)).toBe(true);
    });

    it('combines empty-value clauses with AND and OR', () => {
        expect(matches('.lens=null OR .lens=wide', emptyLens)).toBe(true);
        expect(matches('.lens=null OR .lens=wide', valuedLens)).toBe(true);
        expect(matches('.lens=null OR .lens=wide', missingLens)).toBe(false);
        expect(matches('#photo AND .lens=null', emptyLens)).toBe(false);
        expect(
            fileMatchesFilterTokens('note', ['photo'], parseFilterSearchTokens('#photo AND .lens=null'), {
                hasUnfinishedTasks: false,
                propertyValuesByKey: emptyLens
            })
        ).toBe(true);
    });

    it('matches a literal null value only through the quoted form', () => {
        const literalNull = new Map<string, string[]>([['lens', ['null']]]);
        expect(matches('.lens="null"', literalNull)).toBe(true);
        expect(matches('.lens="null"', emptyLens)).toBe(false);
        expect(matches('.lens=null', literalNull)).toBe(false);
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
        expect(parsed.propertyTokens).toEqual([{ key: 'status=phase', match: 'key' }]);

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
        expect(parsed.propertyTokens).toEqual([{ key: 'status', match: 'value', value: 'in=progress' }]);
    });

    it('round-trips values containing backslashes', () => {
        const added = updateFilterQueryWithProperty('', 'path', 'C:\\Notes\\Daily', 'AND');
        expect(added.query).toBe('.path="c:\\\\notes\\\\daily"');
        expect(added.action).toBe('added');
        expect(added.changed).toBe(true);

        const parsed = parseFilterSearchTokens(added.query);
        expect(parsed.propertyTokens).toEqual([{ key: 'path', match: 'value', value: 'c:\\notes\\daily' }]);
    });

    it('round-trips Markdown-link values through their displayed label', () => {
        const rawValue = '[Project Alpha](https://example.com/projects/alpha)';
        const added = updateFilterQueryWithProperty('', 'reference', rawValue, 'AND');

        expect(added.query).toBe('.reference="project alpha"');
        expect(parseFilterSearchTokens(added.query).propertyTokens).toEqual([{ key: 'reference', match: 'value', value: 'project alpha' }]);
        expect(parseFilterSearchTokens(`.reference="${rawValue}"`).propertyTokens).toEqual([
            { key: 'reference', match: 'value', value: 'project alpha' }
        ]);
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

    it('quotes a literal null value so it does not become the empty-value filter', () => {
        const added = updateFilterQueryWithProperty('', 'lens', 'null', 'AND');
        expect(added.query).toBe('.lens="null"');
        expect(parseFilterSearchTokens(added.query).propertyTokens).toEqual([{ key: 'lens', match: 'value', value: 'null' }]);

        const removed = updateFilterQueryWithProperty(added.query, 'lens', 'null', 'AND');
        expect(removed.query).toBe('');
        expect(removed.action).toBe('removed');
    });

    it('toggles a literal null value without touching an empty-value clause', () => {
        const added = updateFilterQueryWithProperty('.lens=null', 'lens', 'null', 'OR');
        expect(added.query).toBe('.lens=null OR .lens="null"');
        expect(added.action).toBe('added');

        const removed = updateFilterQueryWithProperty(added.query, 'lens', 'null', 'OR');
        expect(removed.query).toBe('.lens=null');
        expect(removed.action).toBe('removed');
    });

    it('adds a key-only clause instead of removing an empty-value clause on the same key', () => {
        const result = updateFilterQueryWithProperty('.lens=null', 'lens', null, 'AND');
        expect(result.query).toBe('.lens=null AND .lens');
        expect(result.action).toBe('added');
    });

    it('keeps empty-value and quoted null clauses intact when other clauses change', () => {
        const result = updateFilterQueryWithProperty('-.lens=null .camera="null"', 'status', null, 'AND');
        expect(result.query).toBe('-.lens=null .camera="null" AND .status');
        expect(parseFilterSearchTokens(result.query).excludePropertyTokens).toEqual([{ key: 'lens', match: 'empty' }]);
        expect(parseFilterSearchTokens(result.query).propertyTokens).toEqual([
            { key: 'camera', match: 'value', value: 'null' },
            { key: 'status', match: 'key' }
        ]);
    });

    it('appends tokens without connectors in mixed queries', () => {
        const result = updateFilterQueryWithProperty('meeting @today', 'status', 'in progress', 'OR');
        expect(result.query).toBe('meeting @today .status="in progress"');
        expect(result.action).toBe('added');
        expect(result.changed).toBe(true);
    });
});
