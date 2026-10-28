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

// Determines evaluation mode for search tokens (filter uses AND for all, tag uses expression tree)
export type FilterMode = 'filter' | 'tag';

// Logical operator for combining tag filter expressions
export type InclusionOperator = 'AND' | 'OR';

// Date field target for @c:/@m: prefix filters (default uses sort-based resolution)
export type DateFilterField = 'default' | 'created' | 'modified';

export interface DateFilterRange {
    field: DateFilterField;
    /** Inclusive lower bound in milliseconds since epoch (local time). */
    startMs: number | null;
    /** Exclusive upper bound in milliseconds since epoch (local time). */
    endMs: number | null;
}

export interface FolderFilterToken {
    mode: 'exact' | 'segment';
    value: string;
}

/**
 * Property clause from a filter search query.
 * - `key` (`.key`): any property key that starts with `key`, with or without a value.
 * - `empty` (`.key=null`): exactly `key`, present in frontmatter with no value.
 * - `value` (`.key=value`): exactly `key`, with a value that contains `value`.
 */
export type PropertySearchToken =
    { key: string; match: 'key' } | { key: string; match: 'empty' } | { key: string; match: 'value'; value: string };

// Operands in a tag/property filter expression tree
export type TagExpressionOperand =
    | {
          kind: 'tag';
          value: string;
      }
    | {
          kind: 'notTag';
          value: string;
      }
    | {
          kind: 'requireTagged';
      }
    | {
          kind: 'untagged';
      }
    | {
          kind: 'property';
          value: PropertySearchToken;
      }
    | {
          kind: 'notProperty';
          value: PropertySearchToken;
      };

// Tokens in a tag filter expression (operands and operators)
export type TagExpressionToken =
    | TagExpressionOperand
    | {
          kind: 'operator';
          operator: InclusionOperator;
      };

/**
 * Tokens extracted from a filter search query.
 */
export interface FilterSearchTokens {
    mode: FilterMode;
    expression: TagExpressionToken[];
    hasInclusions: boolean;
    requiresTags: boolean;
    allRequireTags: boolean;
    requireUnfinishedTasks: boolean;
    excludeUnfinishedTasks: boolean;
    includedTagTokens: string[];
    propertyTokens: PropertySearchToken[];
    excludePropertyTokens: PropertySearchToken[];
    requiresProperties: boolean;
    nameTokens: string[];
    tagTokens: string[];
    dateRanges: DateFilterRange[];
    requireTagged: boolean;
    includeUntagged: boolean;
    excludeNameTokens: string[];
    excludeTagTokens: string[];
    folderTokens: FolderFilterToken[];
    excludeFolderTokens: FolderFilterToken[];
    extensionTokens: string[];
    excludeExtensionTokens: string[];
    excludeDateRanges: DateFilterRange[];
    excludeTagged: boolean;
}
