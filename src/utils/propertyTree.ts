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

import type { FileData } from '../storage/IndexedDBStorage';
import type { PropertyTreeNode, PropertyTreeNodeId } from '../types/storage';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../types';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { IPropertyTreeProvider } from '../interfaces/IPropertyTreeProvider';
import { isPathInExcludedFolder } from './fileFilters';
import { getCachedCommaSeparatedList } from './commaSeparatedListUtils';
import { isPropertyLinkMarkupValue, normalizePropertyTreeValuePath, resolvePropertyDisplayText } from './propertyUtils';
import { casefold } from './recordUtils';
import { naturalCompare } from './sortUtils';
import { isRecord } from './typeGuards';
import { getActivePropertyFields, getActivePropertyKeySet } from './vaultProfiles';

export { normalizePropertyTreeValuePath };

export interface BuildPropertyTreeOptions {
    excludedFolderPatterns?: string[];
    includedPaths?: Set<string>;
    includedPropertyKeys?: ReadonlySet<string>;
}

export interface PropertySelectionValue {
    key: string;
    value: string | null;
    displayKey?: string;
    displayValuePath?: string | null;
}

export type PropertySelectionNodeId = typeof PROPERTIES_ROOT_VIRTUAL_FOLDER_ID | PropertyTreeNodeId;

export interface PropertyTreeDatabaseLike {
    forEachFile: (callback: (path: string, fileData: FileData) => void) => void;
}

export interface PropertyTreeFileLookupDatabaseLike {
    getFile: (path: string) => FileData | null;
}

type PropertyTreeFilePropertyEntry = NonNullable<FileData['properties']>[number];
export type PropertyNodeSourceFile = { data: FileData };

let propertyKeyDirectPathCache: WeakMap<PropertyTreeNode, Set<string>> | null = null;
const configuredPropertyKeyCache = new Map<string, ReadonlySet<string>>();
let propertyNodeIdSetCache: WeakMap<readonly PropertyNodeSourceFile[], Map<string, ReadonlySet<string>>> | null = null;
let configuredPropertyKeyTokenCache: WeakMap<ReadonlySet<string>, string> | null = null;
const PROPERTY_BOOLEAN_VALUE_PATHS = new Set(['true', 'false']);

function getPropertyKeyDirectPathCache(): WeakMap<PropertyTreeNode, Set<string>> {
    if (!propertyKeyDirectPathCache) {
        propertyKeyDirectPathCache = new WeakMap();
    }
    return propertyKeyDirectPathCache;
}

function getPropertyNodeIdSetCache(): WeakMap<readonly PropertyNodeSourceFile[], Map<string, ReadonlySet<string>>> {
    if (!propertyNodeIdSetCache) {
        propertyNodeIdSetCache = new WeakMap();
    }
    return propertyNodeIdSetCache;
}

function getConfiguredPropertyKeyTokenCache(): WeakMap<ReadonlySet<string>, string> {
    if (!configuredPropertyKeyTokenCache) {
        configuredPropertyKeyTokenCache = new WeakMap();
    }
    return configuredPropertyKeyTokenCache;
}

function getConfiguredPropertyKeyToken(configuredKeys: ReadonlySet<string>): string {
    if (configuredKeys.size === 0) {
        return '';
    }

    const tokenCache = getConfiguredPropertyKeyTokenCache();
    const cachedToken = tokenCache.get(configuredKeys);
    if (cachedToken !== undefined) {
        return cachedToken;
    }

    const token = Array.from(configuredKeys).sort().join(',');
    tokenCache.set(configuredKeys, token);
    return token;
}

/**
 * Returns the number of notes for a property value.
 */
export function getTotalPropertyNoteCount(keyNode: PropertyTreeNode, valuePath: string): number {
    if (!valuePath) {
        return 0;
    }

    const nodeId = buildPropertyValueNodeId(keyNode.key, valuePath);
    const valueNode = keyNode.children.get(nodeId);
    return valueNode?.notesWithValue.size ?? 0;
}

/**
 * Returns true when two normalized property value paths represent the same value.
 */
export function matchesPropertyValuePath(candidateValuePath: string, selectedValuePath: string): boolean {
    return candidateValuePath === selectedValuePath;
}

/**
 * Collects note paths for the selected property value.
 */
export function collectPropertyValueFilePaths(keyNode: PropertyTreeNode, valuePath: string): Set<string> {
    const nodeId = buildPropertyValueNodeId(keyNode.key, valuePath);
    const valueNode = keyNode.children.get(nodeId);
    if (!valueNode) {
        return new Set<string>();
    }

    return new Set<string>(valueNode.notesWithValue);
}

/**
 * Checks whether a normalized property value should be treated as a key-level value.
 * Key-level values do not create child value nodes.
 * Boolean literals are treated as key-level values when their original value kind is boolean.
 * Legacy cache entries without value-kind metadata keep previous boolean handling.
 */
export function isPropertyKeyOnlyValuePath(valuePath: string, valueKind?: PropertyTreeFilePropertyEntry['valueKind']): boolean {
    if (valuePath.length === 0) {
        return true;
    }

    if (!PROPERTY_BOOLEAN_VALUE_PATHS.has(valuePath)) {
        return false;
    }

    return valueKind === 'boolean' || valueKind === undefined;
}

/**
 * Checks whether a normalized property value should stay at the key level in the property tree.
 * The tree uses value nodes for boolean literals so `true` and `false` can be selected separately.
 */
function isPropertyTreeKeyOnlyValuePath(valuePath: string): boolean {
    return valuePath.length === 0;
}

/**
 * Registers direct key-level note paths for a property key node.
 */
export function registerPropertyKeyDirectPaths(keyNode: PropertyTreeNode, directPaths: Iterable<string> = []): void {
    getPropertyKeyDirectPathCache().set(keyNode, new Set(directPaths));
}

/**
 * Collects note paths for the selected property key.
 * Includes descendant values when requested.
 */
export function collectPropertyKeyFilePaths(keyNode: PropertyTreeNode, includeDescendants: boolean): Set<string> {
    if (includeDescendants) {
        return new Set(keyNode.notesWithValue);
    }

    return new Set(getOrBuildDirectPropertyKeyPaths(keyNode));
}

/**
 * Returns the number of notes that match only the property key (no child value path).
 */
export function getDirectPropertyKeyNoteCount(keyNode: PropertyTreeNode): number {
    return getOrBuildDirectPropertyKeyPaths(keyNode).size;
}

/**
 * Returns direct note paths for a key node without child value paths.
 */
export function getDirectPropertyKeyFilePathSet(keyNode: PropertyTreeNode): ReadonlySet<string> {
    return getOrBuildDirectPropertyKeyPaths(keyNode);
}

function buildDirectPropertyKeyPaths(keyNode: PropertyTreeNode): Set<string> {
    const directPaths = new Set<string>(keyNode.notesWithValue);
    keyNode.children.forEach(childNode => {
        childNode.notesWithValue.forEach(path => directPaths.delete(path));
    });
    return directPaths;
}

function getOrBuildDirectPropertyKeyPaths(keyNode: PropertyTreeNode): Set<string> {
    const cache = getPropertyKeyDirectPathCache();
    const cachedPaths = cache.get(keyNode);
    if (cachedPaths) {
        return cachedPaths;
    }

    const directPaths = buildDirectPropertyKeyPaths(keyNode);
    cache.set(keyNode, directPaths);
    return directPaths;
}

export function isPropertyFeatureEnabled(settings: NotebookNavigatorSettings): boolean {
    if (!settings.showProperties) {
        return false;
    }

    return getActivePropertyKeySet(settings, 'any').size > 0;
}

export function determinePropertyToReveal(
    properties: FileData['properties'],
    currentSelection: PropertySelectionNodeId | null,
    settings: NotebookNavigatorSettings,
    includeDescendantNotes: boolean
): PropertySelectionNodeId | null {
    if (properties === null) {
        // Keep current selection while property metadata is still hydrating for the active file.
        return currentSelection;
    }

    if (properties.length === 0) {
        return null;
    }

    const configuredKeys = getActivePropertyKeySet(settings, 'navigation');
    if (configuredKeys.size === 0) {
        return null;
    }

    const seenNodeIds = new Set<string>();
    const orderedCandidates: PropertySelectionNodeId[] = [];
    const candidatesByKey = new Map<
        string,
        {
            keyNodeId: PropertyTreeNodeId;
            hasKeyOnlyValue: boolean;
            valueNodeIds: PropertyTreeNodeId[];
            valueNodeIdSet: Set<PropertyTreeNodeId>;
        }
    >();

    const registerCandidate = (nodeId: PropertySelectionNodeId): void => {
        if (seenNodeIds.has(nodeId)) {
            return;
        }
        seenNodeIds.add(nodeId);
        orderedCandidates.push(nodeId);
    };

    for (const entry of properties) {
        const normalizedKey = normalizePropertyTreeKey(entry.fieldKey);
        if (!normalizedKey || !configuredKeys.has(normalizedKey)) {
            continue;
        }

        let keyCandidate = candidatesByKey.get(normalizedKey);
        if (!keyCandidate) {
            keyCandidate = {
                keyNodeId: buildPropertyKeyNodeId(normalizedKey),
                hasKeyOnlyValue: false,
                valueNodeIds: [],
                valueNodeIdSet: new Set()
            };
            candidatesByKey.set(normalizedKey, keyCandidate);
        }

        const normalizedValuePath = normalizePropertyTreeValuePath(entry.value);
        if (isPropertyTreeKeyOnlyValuePath(normalizedValuePath)) {
            keyCandidate.hasKeyOnlyValue = true;
            registerCandidate(keyCandidate.keyNodeId);
            continue;
        }

        if (!normalizedValuePath) {
            continue;
        }

        const valueNodeId = buildPropertyValueNodeId(normalizedKey, normalizedValuePath);
        if (!keyCandidate.valueNodeIdSet.has(valueNodeId)) {
            keyCandidate.valueNodeIdSet.add(valueNodeId);
            keyCandidate.valueNodeIds.push(valueNodeId);
        }
        registerCandidate(valueNodeId);
    }

    if (orderedCandidates.length === 0) {
        return null;
    }

    if (currentSelection === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return includeDescendantNotes ? currentSelection : (orderedCandidates[0] ?? null);
    }

    if (currentSelection) {
        const parsed = parsePropertyNodeId(currentSelection);
        if (parsed) {
            const candidateForKey = candidatesByKey.get(parsed.key);
            if (candidateForKey) {
                if (!parsed.valuePath) {
                    if (includeDescendantNotes || candidateForKey.hasKeyOnlyValue) {
                        return candidateForKey.keyNodeId;
                    }

                    return candidateForKey.valueNodeIds[0] ?? null;
                }

                const normalizedSelectionValuePath = normalizePropertyTreeValuePath(parsed.valuePath);
                if (normalizedSelectionValuePath) {
                    const selectionValueNodeId = buildPropertyValueNodeId(parsed.key, normalizedSelectionValuePath);
                    if (candidateForKey.valueNodeIdSet.has(selectionValueNodeId)) {
                        return selectionValueNodeId;
                    }
                }
            }
        }
    }

    return orderedCandidates[0] ?? null;
}

function normalizePropertyTreeKey(value: string): string {
    return casefold(value);
}

function normalizeIncludedPropertyKeySet(includedPropertyKeys: ReadonlySet<string> | undefined): Set<string> {
    const normalizedKeys = new Set<string>();
    if (!includedPropertyKeys || includedPropertyKeys.size === 0) {
        return normalizedKeys;
    }

    includedPropertyKeys.forEach(propertyKey => {
        const normalizedPropertyKey = normalizePropertyTreeKey(propertyKey);
        if (!normalizedPropertyKey) {
            return;
        }
        normalizedKeys.add(normalizedPropertyKey);
    });

    return normalizedKeys;
}

function compareCanonicalPropertySegments(left: string, right: string): number {
    const naturalResult = naturalCompare(left, right);
    if (naturalResult !== 0) {
        return naturalResult;
    }

    return left.localeCompare(right);
}

function sortPropertyValueChildren(children: Map<string, PropertyTreeNode>): Map<string, PropertyTreeNode> {
    if (children.size <= 1) {
        return children;
    }

    const sortedNodes = Array.from(children.values()).sort((leftNode, rightNode) => {
        const leftPath = leftNode.valuePath ?? '';
        const rightPath = rightNode.valuePath ?? '';
        const pathCompare = compareCanonicalPropertySegments(leftPath, rightPath);
        if (pathCompare !== 0) {
            return pathCompare;
        }
        return leftNode.id.localeCompare(rightNode.id);
    });

    const sortedChildren = new Map<string, PropertyTreeNode>();
    sortedNodes.forEach(node => {
        sortedChildren.set(node.id, node);
    });
    return sortedChildren;
}

function sortPropertyTreeNodes(tree: Map<string, PropertyTreeNode>): Map<string, PropertyTreeNode> {
    const sortedNodes = Array.from(tree.values()).sort((leftNode, rightNode) => {
        const keyCompare = compareCanonicalPropertySegments(leftNode.key, rightNode.key);
        if (keyCompare !== 0) {
            return keyCompare;
        }
        return leftNode.id.localeCompare(rightNode.id);
    });

    const sortedTree = new Map<string, PropertyTreeNode>();
    sortedNodes.forEach(node => {
        node.children = sortPropertyValueChildren(node.children);
        sortedTree.set(node.key, node);
    });
    return sortedTree;
}

function shouldReplaceAssignmentValue(currentValue: string | undefined, candidateValue: string): boolean {
    if (!currentValue) {
        return true;
    }

    return !isPropertyLinkMarkupValue(currentValue) && isPropertyLinkMarkupValue(candidateValue);
}

function getConfiguredPropertyKeySet(propertyFields: string): ReadonlySet<string> {
    const cached = configuredPropertyKeyCache.get(propertyFields);
    if (cached) {
        return cached;
    }

    const keys = new Set<string>();
    for (const fieldName of getCachedCommaSeparatedList(propertyFields)) {
        const normalized = casefold(fieldName);
        if (!normalized) {
            continue;
        }
        keys.add(normalized);
    }

    configuredPropertyKeyCache.set(propertyFields, keys);
    return keys;
}

/**
 * Builds canonical property node ids from database file metadata for configured keys.
 * Results are cached by dbFiles array identity and configured-key token.
 */
function buildConfiguredPropertyNodeIdSet(
    dbFiles: readonly PropertyNodeSourceFile[],
    configuredKeys: ReadonlySet<string>
): ReadonlySet<string> {
    if (configuredKeys.size === 0 || dbFiles.length === 0) {
        return new Set<string>();
    }

    const keyToken = getConfiguredPropertyKeyToken(configuredKeys);
    if (!keyToken) {
        return new Set<string>();
    }

    const cache = getPropertyNodeIdSetCache();
    const perFilesCache = cache.get(dbFiles);
    if (perFilesCache) {
        const cached = perFilesCache.get(keyToken);
        if (cached) {
            return cached;
        }
    }

    const nodeIds = new Set<string>();
    dbFiles.forEach(file => {
        const properties = file.data.properties;
        if (!properties || properties.length === 0) {
            return;
        }

        properties.forEach(entry => {
            const normalizedKey = casefold(entry.fieldKey);
            if (!normalizedKey || !configuredKeys.has(normalizedKey)) {
                return;
            }

            nodeIds.add(buildPropertyKeyNodeId(normalizedKey));

            const normalizedValuePath = normalizePropertyTreeValuePath(entry.value);
            if (isPropertyTreeKeyOnlyValuePath(normalizedValuePath)) {
                return;
            }

            nodeIds.add(buildPropertyValueNodeId(normalizedKey, normalizedValuePath));
        });
    });

    if (perFilesCache) {
        perFilesCache.set(keyToken, nodeIds);
    } else {
        cache.set(dbFiles, new Map([[keyToken, nodeIds]]));
    }

    return nodeIds;
}

/**
 * Creates a property-node validator for configured property keys.
 * Returns null when no validator can be created from the provided inputs.
 */
export function createConfiguredPropertyNodeValidator(params: {
    propertyFields: string;
    dbFiles?: readonly PropertyNodeSourceFile[] | null;
    propertyTreeProvider?: Pick<IPropertyTreeProvider, 'findNode' | 'hasNodes'> | null;
}): ((nodeId: string) => boolean) | null {
    const { propertyFields, dbFiles, propertyTreeProvider } = params;
    const configuredKeys = getConfiguredPropertyKeySet(propertyFields);
    if (configuredKeys.size === 0) {
        return () => false;
    }

    if (dbFiles) {
        const nodeIds = buildConfiguredPropertyNodeIdSet(dbFiles, configuredKeys);
        return nodeId => nodeIds.has(nodeId);
    }

    if (!propertyTreeProvider || !propertyTreeProvider.hasNodes()) {
        return null;
    }

    return nodeId => propertyTreeProvider.findNode(nodeId) !== null;
}

export function isPropertySelectionNodeIdConfigured(
    settings: NotebookNavigatorSettings,
    selectionNodeId: PropertySelectionNodeId
): boolean {
    if (selectionNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return true;
    }

    const normalizedSelectionNodeId = normalizePropertyNodeId(selectionNodeId);
    if (!normalizedSelectionNodeId) {
        return false;
    }

    const parsed = parsePropertyNodeId(normalizedSelectionNodeId);
    if (!parsed) {
        return false;
    }

    return getConfiguredPropertyKeySet(getActivePropertyFields(settings)).has(parsed.key);
}

export function isPropertySelectionNodeIdVisibleInNavigation(
    settings: NotebookNavigatorSettings,
    selectionNodeId: PropertySelectionNodeId
): boolean {
    if (selectionNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return true;
    }

    const normalizedSelectionNodeId = normalizePropertyNodeId(selectionNodeId);
    if (!normalizedSelectionNodeId) {
        return false;
    }

    const parsed = parsePropertyNodeId(normalizedSelectionNodeId);
    if (!parsed) {
        return false;
    }

    return getActivePropertyKeySet(settings, 'navigation').has(parsed.key);
}

export function canRestorePropertySelectionNodeId(settings: NotebookNavigatorSettings, selectionNodeId: PropertySelectionNodeId): boolean {
    if (!settings.showProperties) {
        return false;
    }

    if (selectionNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return true;
    }

    return isPropertySelectionNodeIdVisibleInNavigation(settings, selectionNodeId);
}

/**
 * Resolves a property selection id against the current property tree.
 * Falls back to the key node when a value node no longer exists.
 * Falls back to properties root when the key does not exist.
 */
export function resolvePropertySelectionNodeId(
    propertyTree: ReadonlyMap<string, PropertyTreeNode>,
    selectionNodeId: PropertySelectionNodeId
): PropertySelectionNodeId {
    if (selectionNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return selectionNodeId;
    }

    const normalizedSelectionNodeId = normalizePropertyNodeId(selectionNodeId);
    if (!normalizedSelectionNodeId) {
        return PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    }

    const parsed = parsePropertyNodeId(normalizedSelectionNodeId);
    if (!parsed) {
        return PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    }

    const keyNode = propertyTree.get(parsed.key);
    if (!keyNode) {
        return PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    }

    if (!parsed.valuePath) {
        return keyNode.id;
    }

    const normalizedSelectionValuePath = normalizePropertyTreeValuePath(parsed.valuePath);
    if (!normalizedSelectionValuePath) {
        return keyNode.id;
    }

    const valueNodeId = buildPropertyValueNodeId(parsed.key, normalizedSelectionValuePath);
    if (keyNode.children.has(valueNodeId)) {
        return valueNodeId;
    }

    return keyNode.id;
}

const PROPERTY_NODE_ID_PREFIX = 'key:';
const PROPERTY_NODE_ID_VALUE_DELIMITER = '=';

function encodePropertyNodeSegment(value: string): string {
    return value.replace(/%/g, '%25').replace(/=/g, '%3D');
}

function decodePropertyNodeSegment(value: string): string {
    return value.replace(/%3[dD]/g, '=').replace(/%25/g, '%');
}

export function buildPropertyKeyNodeId(normalizedKey: string): PropertyTreeNodeId {
    return `${PROPERTY_NODE_ID_PREFIX}${encodePropertyNodeSegment(normalizedKey)}`;
}

export function buildPropertyValueNodeId(normalizedKey: string, normalizedValuePath: string): PropertyTreeNodeId {
    return `${PROPERTY_NODE_ID_PREFIX}${encodePropertyNodeSegment(normalizedKey)}${PROPERTY_NODE_ID_VALUE_DELIMITER}${encodePropertyNodeSegment(normalizedValuePath)}`;
}

export function normalizePropertyNodeId(nodeId: string): PropertyTreeNodeId | null {
    const parsed = parsePropertyNodeId(nodeId);
    if (!parsed) {
        return null;
    }

    const normalizedKey = casefold(parsed.key);
    if (!normalizedKey) {
        return null;
    }

    if (!parsed.valuePath) {
        return buildPropertyKeyNodeId(normalizedKey);
    }

    const normalizedValuePath = normalizePropertyTreeValuePath(parsed.valuePath);
    if (!normalizedValuePath) {
        return null;
    }

    return buildPropertyValueNodeId(normalizedKey, normalizedValuePath);
}

export function resolvePropertyShortcutNodeId(
    hydratedNodeId: string | null | undefined,
    shortcutNodeId: string | null | undefined
): string | null {
    const nodeId = hydratedNodeId ?? shortcutNodeId;
    if (!nodeId) {
        return null;
    }

    return normalizePropertyNodeId(nodeId) ?? nodeId;
}

export function resolvePropertyTreeNode(params: {
    nodeId: string;
    propertyTreeService?: Pick<IPropertyTreeProvider, 'findNode' | 'getKeyNode'> | null;
    propertyTree?: ReadonlyMap<string, PropertyTreeNode> | null;
}): { normalizedNodeId: PropertyTreeNodeId; node: PropertyTreeNode } | null {
    const { nodeId, propertyTreeService, propertyTree } = params;
    const normalizedNodeId = normalizePropertyNodeId(nodeId);
    if (!normalizedNodeId) {
        return null;
    }

    const direct = propertyTreeService?.findNode(normalizedNodeId);
    if (direct) {
        return { normalizedNodeId, node: direct };
    }

    const parsed = parsePropertyNodeId(normalizedNodeId);
    if (!parsed) {
        return null;
    }

    const keyNode = propertyTreeService?.getKeyNode(parsed.key) ?? propertyTree?.get(parsed.key) ?? null;
    if (!keyNode) {
        return null;
    }

    if (!parsed.valuePath) {
        return { normalizedNodeId: keyNode.id, node: keyNode };
    }

    const valueNode = keyNode.children.get(normalizedNodeId) ?? null;
    if (!valueNode) {
        return null;
    }

    return { normalizedNodeId, node: valueNode };
}

export function normalizePropertyKeyNodeId(nodeId: string): PropertyTreeNodeId | null {
    const parsed = parsePropertyNodeId(nodeId);
    if (!parsed) {
        return null;
    }

    const normalizedKey = casefold(parsed.key);
    if (!normalizedKey) {
        return null;
    }

    return buildPropertyKeyNodeId(normalizedKey);
}

export function getPropertyKeyNodeIdFromNodeId(nodeId: string): string | null {
    if (!nodeId.startsWith(PROPERTY_NODE_ID_PREFIX)) {
        return null;
    }

    const valueDelimiterIndex = nodeId.indexOf(PROPERTY_NODE_ID_VALUE_DELIMITER, PROPERTY_NODE_ID_PREFIX.length);
    if (valueDelimiterIndex === -1) {
        return nodeId;
    }

    return nodeId.slice(0, valueDelimiterIndex);
}

export function parsePropertyNodeId(nodeId: string): { key: string; valuePath: string | null } | null {
    if (!nodeId.startsWith(PROPERTY_NODE_ID_PREFIX)) {
        return null;
    }

    const encodedBody = nodeId.slice(PROPERTY_NODE_ID_PREFIX.length);
    if (!encodedBody) {
        return null;
    }

    const valueDelimiterIndex = encodedBody.indexOf(PROPERTY_NODE_ID_VALUE_DELIMITER);
    if (valueDelimiterIndex === -1) {
        const key = decodePropertyNodeSegment(encodedBody);
        if (!key) {
            return null;
        }
        return { key, valuePath: null };
    }

    const encodedKey = encodedBody.slice(0, valueDelimiterIndex);
    const encodedValuePath = encodedBody.slice(valueDelimiterIndex + 1);
    if (!encodedKey || !encodedValuePath) {
        return null;
    }

    const key = decodePropertyNodeSegment(encodedKey);
    const valuePath = decodePropertyNodeSegment(encodedValuePath);
    if (!key || !valuePath) {
        return null;
    }

    return { key, valuePath };
}

export function isPropertyTreeNodeId(value: string): value is PropertyTreeNodeId {
    return parsePropertyNodeId(value) !== null;
}

function normalizePropertyTreeDisplayValuePath(rawValue: string): string {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
        return '';
    }

    return resolvePropertyDisplayText(trimmedValue);
}

function getSelectedPropertyNodeId(selection: PropertySelectionValue | null): PropertySelectionNodeId | null {
    if (!selection) {
        return null;
    }

    const normalizedKey = normalizePropertyTreeKey(selection.key);
    if (!normalizedKey) {
        return null;
    }

    if (selection.value) {
        const normalizedValuePath = normalizePropertyTreeValuePath(selection.value);
        if (!normalizedValuePath) {
            return null;
        }

        return buildPropertyValueNodeId(normalizedKey, normalizedValuePath);
    }

    return buildPropertyKeyNodeId(normalizedKey);
}

function parseLegacyStoredPropertySelection(value: unknown): PropertySelectionValue | null {
    if (!isRecord(value)) {
        return null;
    }

    const key = value.key;
    if (typeof key !== 'string' || key.length === 0) {
        return null;
    }

    const selection: PropertySelectionValue = {
        key,
        value: value.value === null ? null : typeof value.value === 'string' ? value.value : null
    };

    if (typeof value.displayKey === 'string' && value.displayKey.length > 0) {
        selection.displayKey = value.displayKey;
    }

    if (value.displayValuePath === null || typeof value.displayValuePath === 'string') {
        selection.displayValuePath = value.displayValuePath;
    }

    return selection;
}

export function parseStoredPropertySelectionNodeId(value: unknown): PropertySelectionNodeId | null {
    if (typeof value === 'string' && value.length > 0) {
        if (value === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
            return PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
        }
        if (!isPropertyTreeNodeId(value)) {
            return null;
        }

        return normalizePropertyNodeId(value);
    }

    const legacySelection = parseLegacyStoredPropertySelection(value);
    if (!legacySelection) {
        return null;
    }

    return getSelectedPropertyNodeId(legacySelection);
}

function registerPropertyTreeEntry(
    tree: Map<string, PropertyTreeNode>,
    path: string,
    propertyEntry: PropertyTreeFilePropertyEntry,
    includedPropertyKeys: ReadonlySet<string>,
    shouldFilterPropertyKeys: boolean
): void {
    const normalizedKey = normalizePropertyTreeKey(propertyEntry.fieldKey);
    if (!normalizedKey) {
        return;
    }

    if (shouldFilterPropertyKeys && !includedPropertyKeys.has(normalizedKey)) {
        return;
    }

    const displayKey = propertyEntry.fieldKey.trim();
    if (!displayKey) {
        return;
    }

    let keyNode = tree.get(normalizedKey);
    if (!keyNode) {
        keyNode = {
            id: buildPropertyKeyNodeId(normalizedKey),
            kind: 'key',
            key: normalizedKey,
            valuePath: null,
            name: displayKey,
            displayPath: displayKey,
            children: new Map(),
            notesWithValue: new Set()
        };
        registerPropertyKeyDirectPaths(keyNode);
        tree.set(normalizedKey, keyNode);
    }

    keyNode.notesWithValue.add(path);

    const normalizedValuePath = normalizePropertyTreeValuePath(propertyEntry.value);
    if (isPropertyTreeKeyOnlyValuePath(normalizedValuePath)) {
        getOrBuildDirectPropertyKeyPaths(keyNode).add(path);
        return;
    }

    const displayValuePath = normalizePropertyTreeDisplayValuePath(propertyEntry.value);
    if (!displayValuePath) {
        return;
    }

    const nodeId = buildPropertyValueNodeId(normalizedKey, normalizedValuePath);
    let valueNode = keyNode.children.get(nodeId);
    if (!valueNode) {
        valueNode = {
            id: nodeId,
            kind: 'value',
            key: normalizedKey,
            valuePath: normalizedValuePath,
            name: displayValuePath,
            displayPath: displayValuePath,
            assignmentValue: propertyEntry.value,
            children: new Map(),
            notesWithValue: new Set()
        };
        keyNode.children.set(nodeId, valueNode);
    } else if (shouldReplaceAssignmentValue(valueNode.assignmentValue, propertyEntry.value)) {
        valueNode.assignmentValue = propertyEntry.value;
    }

    valueNode.notesWithValue.add(path);
}

/**
 * Builds a property tree from the IndexedDB cache.
 *
 * Notes:
 * - Tree roots are property keys.
 * - Value nodes are stored as direct children of keys.
 * - Node ids use normalized lowercase keys/value paths.
 */
export function buildPropertyTreeFromDatabase(
    db: PropertyTreeDatabaseLike,
    options: BuildPropertyTreeOptions = {}
): Map<string, PropertyTreeNode> {
    propertyKeyDirectPathCache = new WeakMap<PropertyTreeNode, Set<string>>();

    const tree = new Map<string, PropertyTreeNode>();
    const excludedFolderPatterns = options.excludedFolderPatterns ?? [];
    const hasExcludedFolders = excludedFolderPatterns.length > 0;
    const includedPaths = options.includedPaths;
    const hasIncludedPropertyFilter = options.includedPropertyKeys !== undefined && options.includedPropertyKeys.size > 0;
    const includedPropertyKeys = normalizeIncludedPropertyKeySet(options.includedPropertyKeys);
    const shouldFilterPropertyKeys = hasIncludedPropertyFilter;

    db.forEachFile((path, fileData) => {
        if (includedPaths && !includedPaths.has(path)) {
            return;
        }

        if (hasExcludedFolders && isPathInExcludedFolder(path, excludedFolderPatterns)) {
            return;
        }

        const properties = fileData.properties;
        if (!properties || properties.length === 0) {
            return;
        }

        for (const propertyEntry of properties) {
            registerPropertyTreeEntry(tree, path, propertyEntry, includedPropertyKeys, shouldFilterPropertyKeys);
        }
    });

    return sortPropertyTreeNodes(tree);
}

/**
 * Builds a property tree from a known set of markdown file paths.
 * Scoped navigation uses this to keep builds proportional to the current selection.
 */
export function buildPropertyTreeFromFilePaths(
    db: PropertyTreeFileLookupDatabaseLike,
    filePaths: Iterable<string>,
    options: Pick<BuildPropertyTreeOptions, 'includedPropertyKeys'> = {}
): Map<string, PropertyTreeNode> {
    propertyKeyDirectPathCache = new WeakMap<PropertyTreeNode, Set<string>>();

    const tree = new Map<string, PropertyTreeNode>();
    const hasIncludedPropertyFilter = options.includedPropertyKeys !== undefined && options.includedPropertyKeys.size > 0;
    const includedPropertyKeys = normalizeIncludedPropertyKeySet(options.includedPropertyKeys);
    const shouldFilterPropertyKeys = hasIncludedPropertyFilter;

    for (const path of filePaths) {
        const fileData = db.getFile(path);
        if (!fileData) {
            continue;
        }

        const properties = fileData.properties;
        if (!properties || properties.length === 0) {
            continue;
        }

        for (const propertyEntry of properties) {
            registerPropertyTreeEntry(tree, path, propertyEntry, includedPropertyKeys, shouldFilterPropertyKeys);
        }
    }

    return sortPropertyTreeNodes(tree);
}
