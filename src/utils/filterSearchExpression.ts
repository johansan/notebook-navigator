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

import type {
    FilterSearchTokens,
    InclusionOperator,
    PropertySearchToken,
    TagExpressionOperand,
    TagExpressionToken
} from './filterSearchTypes';

type TagModeCandidateToken = {
    kind: string;
    operator?: InclusionOperator;
    value?: unknown;
};

type TagModeToken =
    | {
          kind: 'operator';
          operator: InclusionOperator;
      }
    | {
          kind: 'tag';
          value: string | null;
      }
    | {
          kind: 'tagNegation';
          value: string | null;
      }
    | {
          kind: 'property';
          value: PropertySearchToken;
      }
    | {
          kind: 'propertyNegation';
          value: PropertySearchToken;
      };

// Result of building a tag expression tree from classified tokens
interface TagExpressionBuildResult {
    expression: TagExpressionToken[];
    includeUntagged: boolean;
    requireTagged: boolean;
    includedTagTokens: string[];
    includedPropertyTokens: PropertySearchToken[];
}

// Precedence values for expression evaluation (higher number binds tighter)
const OPERATOR_PRECEDENCE: Record<InclusionOperator, number> = {
    AND: 2,
    OR: 1
};

// Checks if a tag token matches a folded tag path (exact or descendant)
export const tagMatchesToken = (tagPath: string, token: string): boolean => {
    if (!tagPath || !token) {
        return false;
    }
    return tagPath === token || tagPath.startsWith(`${token}/`);
};

export const propertyTokenMatches = (propertiesByKey: Map<string, string[]>, token: PropertySearchToken): boolean => {
    if (token.value === null) {
        // Key-only filters act as type-ahead searches, while value filters keep exact keys so
        // `.status=done` cannot silently match another property such as `status-old`.
        for (const key of propertiesByKey.keys()) {
            if (key.startsWith(token.key)) {
                return true;
            }
        }
        return false;
    }

    const values = propertiesByKey.get(token.key);
    if (!values) {
        return false;
    }
    const propertyValue = token.value;
    return values.some(value => value.includes(propertyValue));
};

const isPropertySearchToken = (value: unknown): value is PropertySearchToken => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    if (!('key' in value) || typeof value.key !== 'string') {
        return false;
    }
    if (!('value' in value)) {
        return false;
    }

    return typeof value.value === 'string' || value.value === null;
};

const isOperatorToken = (token: TagModeCandidateToken): token is Extract<TagModeToken, { kind: 'operator' }> => {
    return token.kind === 'operator' && (token.operator === 'AND' || token.operator === 'OR');
};

const isStringValueToken = <TKind extends 'tag' | 'tagNegation'>(
    token: TagModeCandidateToken,
    kind: TKind
): token is Extract<TagModeToken, { kind: TKind }> => {
    return token.kind === kind && (typeof token.value === 'string' || token.value === null);
};

const isPropertyValueToken = <TKind extends 'property' | 'propertyNegation'>(
    token: TagModeCandidateToken,
    kind: TKind
): token is Extract<TagModeToken, { kind: TKind }> => {
    return token.kind === kind && isPropertySearchToken(token.value);
};

// Builds a postfix expression tree from classified tokens using operator precedence
const buildTagExpression = (classifiedTokens: readonly TagModeToken[]): TagExpressionBuildResult | null => {
    const expression: TagExpressionToken[] = [];
    const operatorStack: InclusionOperator[] = [];
    const positiveTags = new Set<string>();
    const positiveProperties = new Map<string, PropertySearchToken>();

    let expectOperand = true;
    let includeUntagged = false;
    let requireTagged = false;
    let hasOperand = false;

    // Pushes an operator to the expression, respecting precedence
    const pushOperator = (operator: InclusionOperator): boolean => {
        if (expectOperand) {
            return false;
        }

        // Pop higher or equal precedence operators from stack
        while (operatorStack.length > 0) {
            const top = operatorStack[operatorStack.length - 1];
            if (OPERATOR_PRECEDENCE[top] >= OPERATOR_PRECEDENCE[operator]) {
                const popped = operatorStack.pop();
                if (!popped) {
                    return false;
                }
                expression.push({ kind: 'operator', operator: popped });
            } else {
                break;
            }
        }

        operatorStack.push(operator);
        expectOperand = true;
        return true;
    };

    // Pushes an operand to the expression, inserting implicit AND if needed
    const pushOperand = (operand: TagExpressionOperand): boolean => {
        if (!expectOperand) {
            // Insert implicit AND between adjacent operands
            if (!pushOperator('AND')) {
                return false;
            }
        }

        expression.push(operand);
        expectOperand = false;
        hasOperand = true;
        return true;
    };

    for (const token of classifiedTokens) {
        if (token.kind === 'operator') {
            if (!pushOperator(token.operator)) {
                return null;
            }
            continue;
        }

        if (token.kind === 'tag') {
            if (token.value === null) {
                if (!pushOperand({ kind: 'requireTagged' })) {
                    return null;
                }
                requireTagged = true;
            } else {
                if (!pushOperand({ kind: 'tag', value: token.value })) {
                    return null;
                }
                positiveTags.add(token.value);
            }
            continue;
        }

        if (token.kind === 'tagNegation') {
            if (token.value === null) {
                if (!pushOperand({ kind: 'untagged' })) {
                    return null;
                }
                includeUntagged = true;
            } else {
                if (!pushOperand({ kind: 'notTag', value: token.value })) {
                    return null;
                }
            }
            continue;
        }

        if (token.kind === 'property') {
            if (!pushOperand({ kind: 'property', value: token.value })) {
                return null;
            }
            const propertyKey = token.value.value ? `${token.value.key}=${token.value.value}` : token.value.key;
            if (!positiveProperties.has(propertyKey)) {
                positiveProperties.set(propertyKey, token.value);
            }
            continue;
        }

        if (token.kind === 'propertyNegation') {
            if (!pushOperand({ kind: 'notProperty', value: token.value })) {
                return null;
            }
            continue;
        }

        return null;
    }

    // Validate expression is not incomplete
    if (expectOperand) {
        return null;
    }

    // Pop remaining operators from stack
    while (operatorStack.length > 0) {
        const operator = operatorStack.pop();
        if (!operator) {
            break;
        }
        expression.push({ kind: 'operator', operator });
    }

    // Validate expression has at least one operand
    if (!hasOperand) {
        return null;
    }

    // Validate postfix expression structure (each operator consumes two operands)
    let depth = 0;
    for (const token of expression) {
        if (token.kind === 'operator') {
            if (depth < 2) {
                return null;
            }
            depth -= 1;
        } else {
            depth += 1;
        }
    }

    // Final depth should be exactly 1 (single result)
    if (depth !== 1) {
        return null;
    }

    return {
        expression,
        includeUntagged,
        requireTagged,
        includedTagTokens: Array.from(positiveTags),
        includedPropertyTokens: Array.from(positiveProperties.values())
    };
};

// Evaluates a postfix tag expression against a file's tags
export const evaluateTagExpression = (
    expression: TagExpressionToken[],
    foldedTags: string[],
    propertyValuesByKey: Map<string, string[]>
): boolean => {
    if (expression.length === 0) {
        return true;
    }

    const stack: boolean[] = [];

    const hasTagMatch = (token: string): boolean => {
        for (const tag of foldedTags) {
            if (tagMatchesToken(tag, token)) {
                return true;
            }
        }
        return false;
    };

    for (const token of expression) {
        if (token.kind === 'operator') {
            const right = stack.pop();
            const left = stack.pop();
            if (left === undefined || right === undefined) {
                return false;
            }
            stack.push(token.operator === 'AND' ? left && right : left || right);
            continue;
        }

        let value = false;
        if (token.kind === 'tag') {
            value = hasTagMatch(token.value);
        } else if (token.kind === 'notTag') {
            value = !hasTagMatch(token.value);
        } else if (token.kind === 'requireTagged') {
            value = foldedTags.length > 0;
        } else if (token.kind === 'untagged') {
            value = foldedTags.length === 0;
        } else if (token.kind === 'property') {
            value = propertyTokenMatches(propertyValuesByKey, token.value);
        } else if (token.kind === 'notProperty') {
            value = !propertyTokenMatches(propertyValuesByKey, token.value);
        }
        stack.push(value);
    }

    return stack.length === 0 ? true : Boolean(stack[stack.length - 1]);
};

const evaluateTagRequirementExpression = (expression: TagExpressionToken[], foldedTags: string[]): boolean => {
    if (expression.length === 0) {
        return true;
    }

    const stack: boolean[] = [];

    const hasTagMatch = (token: string): boolean => {
        for (const tag of foldedTags) {
            if (tagMatchesToken(tag, token)) {
                return true;
            }
        }
        return false;
    };

    for (const token of expression) {
        if (token.kind === 'operator') {
            const right = stack.pop();
            const left = stack.pop();
            if (left === undefined || right === undefined) {
                return false;
            }
            stack.push(token.operator === 'AND' ? left && right : left || right);
            continue;
        }

        let value = false;
        if (token.kind === 'tag') {
            value = hasTagMatch(token.value);
        } else if (token.kind === 'notTag') {
            value = !hasTagMatch(token.value);
        } else if (token.kind === 'requireTagged') {
            value = foldedTags.length > 0;
        } else if (token.kind === 'untagged') {
            value = foldedTags.length === 0;
        } else if (token.kind === 'property' || token.kind === 'notProperty') {
            value = true;
        }
        stack.push(value);
    }

    return stack.length === 0 ? true : Boolean(stack[stack.length - 1]);
};

// Parses tokens into tag expression mode with OR/AND precedence
export const parseTagModeTokens = (
    classifiedTokens: readonly TagModeCandidateToken[],
    excludeTagTokens: string[],
    excludePropertyTokens: PropertySearchToken[]
): FilterSearchTokens | null => {
    const tagExpressionTokens: TagModeToken[] = [];
    for (const token of classifiedTokens) {
        if (isOperatorToken(token)) {
            tagExpressionTokens.push(token);
            continue;
        }

        if (isStringValueToken(token, 'tag') || isStringValueToken(token, 'tagNegation')) {
            tagExpressionTokens.push(token);
            continue;
        }

        if (isPropertyValueToken(token, 'property') || isPropertyValueToken(token, 'propertyNegation')) {
            tagExpressionTokens.push(token);
            continue;
        }

        // Tag mode accepts only tag/property operands and connectors.
        // Non-tag operands are handled in filter mode.
        return null;
    }

    const buildResult = buildTagExpression(tagExpressionTokens);
    if (!buildResult) {
        return null;
    }

    const { expression, includeUntagged, requireTagged, includedTagTokens, includedPropertyTokens } = buildResult;
    const hasInclusions = expression.length > 0;
    const requiresTags = expression.some(token => {
        return (
            token.kind !== 'operator' &&
            (token.kind === 'tag' || token.kind === 'notTag' || token.kind === 'requireTagged' || token.kind === 'untagged')
        );
    });
    const requiresProperties = expression.some(token => {
        return token.kind !== 'operator' && (token.kind === 'property' || token.kind === 'notProperty');
    });
    // Check if empty tag array would fail (meaning all clauses require tags)
    const allRequireTags = hasInclusions ? !evaluateTagRequirementExpression(expression, []) : false;

    return {
        mode: 'tag',
        expression,
        hasInclusions,
        requiresTags,
        allRequireTags,
        requireUnfinishedTasks: false,
        excludeUnfinishedTasks: false,
        includedTagTokens,
        propertyTokens: includedPropertyTokens,
        excludePropertyTokens,
        requiresProperties,
        nameTokens: [],
        tagTokens: includedTagTokens.slice(),
        dateRanges: [],
        requireTagged,
        includeUntagged,
        excludeNameTokens: [],
        excludeTagTokens,
        folderTokens: [],
        excludeFolderTokens: [],
        extensionTokens: [],
        excludeExtensionTokens: [],
        excludeDateRanges: [],
        excludeTagged: false
    };
};
