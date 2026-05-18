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

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../../../src/settings/defaultSettings';
import { useFileItemPills, type UseFileItemPillsParams } from '../../../src/components/fileItem/useFileItemPills';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../../src/utils/propertyTree';
import { createHiddenTagVisibility, type HiddenTagVisibility } from '../../../src/utils/tagPrefixMatcher';
import type { FileItemPillDecorationModel } from '../../../src/utils/fileItemPillDecoration';
import { createTestTFile } from '../../utils/createTestTFile';
import { ItemType } from '../../../src/types';

const mockOpenLinkText = vi.fn();
const mockNavigateToTag = vi.fn();
const mockNavigateToProperty = vi.fn();
const mockSelectionState: {
    selectionType: (typeof ItemType)[keyof typeof ItemType];
    selectedTag: string | null;
    selectedProperty: string | null;
} = {
    selectionType: ItemType.FOLDER,
    selectedTag: null,
    selectedProperty: null
};
const mockMetadataService = {
    getTagColorData: vi.fn<(tag: string) => { color?: string; background?: string }>(),
    getTagIcon: vi.fn<(tag: string) => string | undefined>(),
    getPropertyColorData: vi.fn<(nodeId: string) => { color?: string; background?: string }>(),
    getPropertyIcon: vi.fn<(nodeId: string) => string | undefined>()
};

vi.mock('../../../src/context/ServicesContext', () => ({
    useServices: () => ({
        app: {
            workspace: {
                openLinkText: mockOpenLinkText
            }
        },
        isMobile: false
    }),
    useMetadataService: () => mockMetadataService
}));

vi.mock('../../../src/context/SelectionContext', () => ({
    useSelectionState: () => mockSelectionState
}));

vi.mock('../../../src/hooks/useTagNavigation', () => ({
    useTagNavigation: () => ({
        navigateToTag: mockNavigateToTag,
        navigateToProperty: mockNavigateToProperty
    })
}));

vi.mock('../../../src/components/ServiceIcon', () => ({
    ServiceIcon: ({ iconId, className }: { iconId: string; className?: string }) =>
        React.createElement('span', { 'data-icon-id': iconId, className })
}));

function renderPillRows(
    params: Omit<UseFileItemPillsParams, 'hiddenTagVisibility' | 'fileItemPillDecorationModel' | 'wordCountDisplayText'> & {
        hiddenTagVisibility?: HiddenTagVisibility;
        fileItemPillDecorationModel?: FileItemPillDecorationModel;
        wordCountDisplayText?: string | null;
    }
): string {
    const emptyDecorationModel: FileItemPillDecorationModel = {
        navRainbowMode: 'none',
        tagRainbowColors: {
            colorsByPath: new Map(),
            rootColor: undefined,
            getInheritedColor: () => undefined
        },
        propertyRainbowColors: {
            colorsByNodeId: new Map(),
            rootColor: undefined,
            rootColorsByKey: new Map()
        },
        inheritPropertyColors: false
    };

    function Host() {
        const state = useFileItemPills({
            ...params,
            wordCountDisplayText:
                params.wordCountDisplayText ??
                (typeof params.wordCount === 'number' ? Math.trunc(params.wordCount).toLocaleString() : null),
            hiddenTagVisibility: params.hiddenTagVisibility ?? createHiddenTagVisibility([], false),
            fileItemPillDecorationModel: params.fileItemPillDecorationModel ?? emptyDecorationModel
        });
        return React.createElement(
            'div',
            {
                'data-show-tags': state.shouldShowFileTags ? 'true' : 'false',
                'data-show-properties': state.shouldShowProperty ? 'true' : 'false',
                'data-show-word-count': state.shouldShowWordCountProperty ? 'true' : 'false'
            },
            state.pillRows
        );
    }

    return renderToStaticMarkup(React.createElement(Host));
}

describe('useFileItemPills', () => {
    beforeEach(() => {
        mockOpenLinkText.mockReset();
        mockNavigateToTag.mockReset();
        mockNavigateToProperty.mockReset();
        mockSelectionState.selectionType = ItemType.FOLDER;
        mockSelectionState.selectedTag = null;
        mockSelectionState.selectedProperty = null;
        mockMetadataService.getTagColorData.mockReset();
        mockMetadataService.getTagIcon.mockReset();
        mockMetadataService.getPropertyColorData.mockReset();
        mockMetadataService.getPropertyIcon.mockReset();

        mockMetadataService.getTagColorData.mockImplementation(() => ({}));
        mockMetadataService.getTagIcon.mockImplementation(() => undefined);
        mockMetadataService.getPropertyColorData.mockImplementation(() => ({}));
        mockMetadataService.getPropertyIcon.mockImplementation(() => undefined);
    });

    it('renders custom-colored tags before uncolored tags when custom-color priority is enabled', () => {
        mockMetadataService.getTagColorData.mockImplementation(tag => {
            if (tag === 'beta') {
                return { color: '#ff0000' };
            }

            return {};
        });

        const markup = renderPillRows({
            file: createTestTFile('Notes/Daily.md'),
            isCompactMode: false,
            tags: ['alpha', 'beta'],
            properties: null,
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showTags: true,
                showFileTags: true,
                colorFileTags: true,
                prioritizeColoredFileTags: true,
                tagColors: { beta: '#ff0000' }
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('data-show-tags="true"');
        expect(markup.indexOf('beta')).toBeLessThan(markup.indexOf('alpha'));
        expect(markup).toContain('style="color:#ff0000"');
    });

    it('does not prioritize tags that only have rainbow colors', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/RainbowPriority.md'),
            isCompactMode: false,
            tags: ['alpha', 'beta'],
            properties: null,
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showTags: true,
                showFileTags: true,
                colorFileTags: true,
                prioritizeColoredFileTags: true
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>(),
            fileItemPillDecorationModel: {
                navRainbowMode: 'foreground',
                tagRainbowColors: {
                    colorsByPath: new Map([['beta', '#00ff00']]),
                    rootColor: undefined,
                    getInheritedColor: () => undefined
                },
                propertyRainbowColors: {
                    colorsByNodeId: new Map(),
                    rootColor: undefined,
                    rootColorsByKey: new Map()
                },
                inheritPropertyColors: false
            }
        });

        expect(markup.indexOf('>alpha<')).toBeLessThan(markup.indexOf('>beta<'));
        expect(markup).toContain('style="color:#00ff00"');
    });

    it('applies rainbow tag colors in file list pills', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Rainbow.md'),
            isCompactMode: false,
            tags: ['Alpha'],
            properties: null,
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showTags: true,
                showFileTags: true,
                colorFileTags: true
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>(),
            fileItemPillDecorationModel: {
                navRainbowMode: 'foreground',
                tagRainbowColors: {
                    colorsByPath: new Map([['alpha', '#00ff00']]),
                    rootColor: undefined,
                    getInheritedColor: () => undefined
                },
                propertyRainbowColors: {
                    colorsByNodeId: new Map(),
                    rootColor: undefined,
                    rootColorsByKey: new Map()
                },
                inheritPropertyColors: false
            }
        });

        expect(markup).toContain('style="color:#00ff00"');
    });

    it('renders word count pill rows for markdown notes when word count is active', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Counted.md'),
            isCompactMode: false,
            tags: [],
            properties: null,
            wordCount: 1234,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                showWordCount: true,
                wordCountPlacement: 'property'
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('data-show-word-count="true"');
        expect(markup).toContain('1,234');
    });

    it('renders configured word count target text as a property pill', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Target.md'),
            isCompactMode: false,
            tags: [],
            properties: [{ fieldKey: 'word-goal', value: '5000', valueKind: 'number' }],
            wordCount: 1250,
            wordCountDisplayText: '25%',
            settings: {
                ...DEFAULT_SETTINGS,
                showWordCount: true,
                wordCountPlacement: 'property'
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('data-show-word-count="true"');
        expect(markup).toContain('25%');
    });

    it('filters hidden tags using the provided visibility helper', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Hidden.md'),
            isCompactMode: false,
            tags: ['visible', 'archive/private'],
            properties: null,
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showTags: true,
                showFileTags: true
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>(),
            hiddenTagVisibility: createHiddenTagVisibility(['archive'], false)
        });

        expect(markup).toContain('visible');
        expect(markup).not.toContain('archive/private');
    });

    it('hides only the exact selected tag pill in tag context', () => {
        mockSelectionState.selectionType = ItemType.TAG;
        mockSelectionState.selectedTag = 'ai';

        const markup = renderPillRows({
            file: createTestTFile('Notes/Tags.md'),
            isCompactMode: false,
            tags: ['ai', 'ai/openai', 'ml'],
            properties: null,
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showTags: true,
                showFileTags: true,
                showFileTagAncestors: true
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).not.toContain('>ai<');
        expect(markup).toContain('ai/openai');
        expect(markup).toContain('ml');
    });

    it('hides nested selected tag pills only on exact matches', () => {
        mockSelectionState.selectionType = ItemType.TAG;
        mockSelectionState.selectedTag = 'ai/openai';

        const markup = renderPillRows({
            file: createTestTFile('Notes/Tags.md'),
            isCompactMode: false,
            tags: ['ai', 'ai/openai'],
            properties: null,
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showTags: true,
                showFileTags: true,
                showFileTagAncestors: true
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('>ai<');
        expect(markup).not.toContain('ai/openai');
    });

    it('shows the selected tag pill when the list setting is enabled', () => {
        mockSelectionState.selectionType = ItemType.TAG;
        mockSelectionState.selectedTag = 'ai';

        const markup = renderPillRows({
            file: createTestTFile('Notes/Tags.md'),
            isCompactMode: false,
            tags: ['ai', 'ml'],
            properties: null,
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showTags: true,
                showFileTags: true,
                showSelectedNavigationPills: true
            },
            visiblePropertyKeys: new Set<string>(),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('>ai<');
        expect(markup).toContain('>ml<');
    });

    it('renders external property links using their display text', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[GitHub issue](https://github.com/johansan/notebook-navigator/issues/935)',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('GitHub issue');
        expect(markup).not.toContain('https://github.com/johansan/notebook-navigator/issues/935');
        expect(markup).toContain('nn-file-property-link');
        expect(markup).toContain('nn-clickable-tag');
        expect(markup).toContain('data-icon-id="external-link"');
    });

    it('renders numeric property values', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Numbers.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'rating',
                    value: '4.5',
                    valueKind: 'number'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true
            },
            visiblePropertyKeys: new Set<string>(['rating']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('data-show-properties="true"');
        expect(markup).toContain('4.5');
    });

    it('hides only the exact selected property value pill in property value context', () => {
        mockSelectionState.selectionType = ItemType.PROPERTY;
        mockSelectionState.selectedProperty = buildPropertyValueNodeId('status', 'done');

        const markup = renderPillRows({
            file: createTestTFile('Notes/Status.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'status',
                    value: 'done',
                    valueKind: 'string'
                },
                {
                    fieldKey: 'status',
                    value: 'doing',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true
            },
            visiblePropertyKeys: new Set<string>(['status']),
            visibleNavigationPropertyKeys: new Set<string>(['status'])
        });

        expect(markup).not.toContain('>done<');
        expect(markup).toContain('doing');
    });

    it('keeps matching property value pills visible in property key context', () => {
        mockSelectionState.selectionType = ItemType.PROPERTY;
        mockSelectionState.selectedProperty = buildPropertyKeyNodeId('status');

        const markup = renderPillRows({
            file: createTestTFile('Notes/Status.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'status',
                    value: 'done',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true
            },
            visiblePropertyKeys: new Set<string>(['status']),
            visibleNavigationPropertyKeys: new Set<string>(['status'])
        });

        expect(markup).toContain('>done<');
    });

    it('shows the selected property value pill when the list setting is enabled', () => {
        mockSelectionState.selectionType = ItemType.PROPERTY;
        mockSelectionState.selectedProperty = buildPropertyValueNodeId('status', 'done');

        const markup = renderPillRows({
            file: createTestTFile('Notes/Status.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'status',
                    value: 'done',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                showSelectedNavigationPills: true
            },
            visiblePropertyKeys: new Set<string>(['status']),
            visibleNavigationPropertyKeys: new Set<string>(['status'])
        });

        expect(markup).toContain('>done<');
    });

    it('renders custom-colored properties before uncolored properties when custom-color priority is enabled', () => {
        const betaNodeId = buildPropertyValueNodeId('status', 'beta');
        mockMetadataService.getPropertyColorData.mockImplementation(nodeId => (nodeId === betaNodeId ? { color: '#ff0000' } : {}));

        const markup = renderPillRows({
            file: createTestTFile('Notes/Properties.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'status',
                    value: 'alpha',
                    valueKind: 'string'
                },
                {
                    fieldKey: 'status',
                    value: 'beta',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                colorFileProperties: true,
                prioritizeColoredFileProperties: true,
                propertyColors: { [betaNodeId]: '#ff0000' }
            },
            visiblePropertyKeys: new Set<string>(['status']),
            visibleNavigationPropertyKeys: new Set<string>(['status'])
        });

        expect(markup.indexOf('>beta<')).toBeLessThan(markup.indexOf('>alpha<'));
        expect(markup).toContain('style="color:#ff0000"');
    });

    it('does not prioritize properties that only have rainbow colors', () => {
        const betaNodeId = buildPropertyValueNodeId('status', 'beta');
        const markup = renderPillRows({
            file: createTestTFile('Notes/RainbowProperties.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'status',
                    value: 'alpha',
                    valueKind: 'string'
                },
                {
                    fieldKey: 'status',
                    value: 'beta',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                colorFileProperties: true,
                prioritizeColoredFileProperties: true
            },
            visiblePropertyKeys: new Set<string>(['status']),
            visibleNavigationPropertyKeys: new Set<string>(['status']),
            fileItemPillDecorationModel: {
                navRainbowMode: 'foreground',
                tagRainbowColors: {
                    colorsByPath: new Map(),
                    rootColor: undefined,
                    getInheritedColor: () => undefined
                },
                propertyRainbowColors: {
                    colorsByNodeId: new Map([[betaNodeId, '#00aa00']]),
                    rootColor: undefined,
                    rootColorsByKey: new Map()
                },
                inheritPropertyColors: false
            }
        });

        expect(markup.indexOf('>alpha<')).toBeLessThan(markup.indexOf('>beta<'));
        expect(markup).toContain('style="color:#00aa00"');
    });

    it('applies rainbow property colors in file list pills', () => {
        const statusNodeId = buildPropertyValueNodeId('status', 'done');
        const markup = renderPillRows({
            file: createTestTFile('Notes/Status.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'status',
                    value: 'done',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                colorFileProperties: true
            },
            visiblePropertyKeys: new Set<string>(['status']),
            visibleNavigationPropertyKeys: new Set<string>(['status']),
            fileItemPillDecorationModel: {
                navRainbowMode: 'foreground',
                tagRainbowColors: {
                    colorsByPath: new Map(),
                    rootColor: undefined,
                    getInheritedColor: () => undefined
                },
                propertyRainbowColors: {
                    colorsByNodeId: new Map([[statusNodeId, '#00aa00']]),
                    rootColor: undefined,
                    rootColorsByKey: new Map()
                },
                inheritPropertyColors: false
            }
        });

        expect(markup).toContain('style="color:#00aa00"');
    });

    it('inherits rainbow property colors for escaped property keys', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/EscapedStatus.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'status=final%',
                    value: 'done',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                colorFileProperties: true
            },
            visiblePropertyKeys: new Set<string>(['status=final%']),
            visibleNavigationPropertyKeys: new Set<string>(['status=final%']),
            fileItemPillDecorationModel: {
                navRainbowMode: 'foreground',
                tagRainbowColors: {
                    colorsByPath: new Map(),
                    rootColor: undefined,
                    getInheritedColor: () => undefined
                },
                propertyRainbowColors: {
                    colorsByNodeId: new Map(),
                    rootColor: undefined,
                    rootColorsByKey: new Map([['status=final%', '#118833']])
                },
                inheritPropertyColors: true
            }
        });

        expect(markup).toContain('done');
        expect(markup).toContain('style="color:#118833"');
    });

    it('renders boolean property values as value pills', () => {
        const booleanValueNodeId = buildPropertyValueNodeId('flag', 'true');
        mockMetadataService.getPropertyIcon.mockImplementation(nodeId => (nodeId === booleanValueNodeId ? 'check' : undefined));

        const markup = renderPillRows({
            file: createTestTFile('Notes/Flags.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'flag',
                    value: 'true',
                    valueKind: 'boolean'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                propertyIcons: { flag: 'key-icon' }
            },
            visiblePropertyKeys: new Set<string>(['flag']),
            visibleNavigationPropertyKeys: new Set<string>(['flag'])
        });

        expect(markup).toContain('data-show-properties="true"');
        expect(markup).toContain('true');
        expect(markup).toContain('data-icon-id="check"');
    });

    it('renders bare external URLs as clickable property links', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: 'https://github.com/johansan/notebook-navigator/issues/935',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('https://github.com/johansan/notebook-navigator/issues/935');
        expect(markup).toContain('nn-file-property-link');
        expect(markup).toContain('nn-clickable-tag');
        expect(markup).toContain('data-icon-id="external-link"');
    });

    it('renders bare custom URIs as clickable property links', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: 'zotero://open-pdf/library/items/A65QUPQU',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('zotero://open-pdf/library/items/A65QUPQU');
        expect(markup).toContain('nn-file-property-link');
        expect(markup).toContain('nn-clickable-tag');
        expect(markup).toContain('data-icon-id="external-link"');
    });

    it('renders markdown custom URIs as clickable property links', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[Open in Zotero](zotero://open-pdf/library/items/A65QUPQU)',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('Open in Zotero');
        expect(markup).not.toContain('zotero://open-pdf/library/items/A65QUPQU');
        expect(markup).toContain('nn-file-property-link');
        expect(markup).toContain('nn-clickable-tag');
        expect(markup).toContain('data-icon-id="external-link"');
    });

    it('renders unsupported markdown URI targets as plain property values', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[Run script](javascript:alert(1))',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('Run script');
        expect(markup).not.toContain('nn-file-property-link');
        expect(markup).not.toContain('data-icon-id="external-link"');
    });

    it('keeps unsupported markdown URI targets non-clickable when property navigation is available', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[Run script](javascript:alert(1))',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>(['reference'])
        });

        expect(markup).toContain('Run script');
        expect(markup).not.toContain('nn-clickable-tag');
        expect(markup).not.toContain('nn-file-property-link');
        expect(markup).not.toContain('role="button"');
        expect(markup).not.toContain('tabindex="0"');
    });

    it('renders markdown file URIs as clickable property links', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[Open file](file:///Users/example/Documents/reference.pdf)',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('Open file');
        expect(markup).toContain('nn-clickable-tag');
        expect(markup).toContain('nn-file-property-link');
        expect(markup).toContain('data-icon-id="external-link"');
    });

    it('renders bare file URIs as clickable property links', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: 'file:///Users/example/Documents/reference.pdf',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('file:///Users/example/Documents/reference.pdf');
        expect(markup).toContain('nn-clickable-tag');
        expect(markup).toContain('nn-file-property-link');
        expect(markup).toContain('data-icon-id="external-link"');
    });

    it('renders mailto URIs as clickable property links', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[Email author](mailto:test@example.com)',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: true
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('Email author');
        expect(markup).toContain('nn-clickable-tag');
        expect(markup).toContain('nn-file-property-link');
        expect(markup).toContain('data-icon-id="external-link"');
    });

    it('renders internal property links as plain property values when link opening is disabled', () => {
        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[[Tech Insights/Tech Insights 2026 Week 11|Tech Insights 2026 Week 11]]',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyInternalLinks: false
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('Tech Insights 2026 Week 11');
        expect(markup).not.toContain('nn-file-property-link');
        expect(markup).not.toContain('nn-clickable-tag');
    });

    it('uses the external link icon instead of custom property icons for external links', () => {
        mockMetadataService.getPropertyIcon.mockImplementation(() => 'star');

        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[GitHub issue](https://github.com/johansan/notebook-navigator/issues/935)',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                propertyIcons: { reference: 'star' }
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).toContain('data-icon-id="external-link"');
        expect(markup).not.toContain('data-icon-id="star"');
        expect(mockMetadataService.getPropertyIcon).not.toHaveBeenCalled();
    });

    it('does not show the external link icon when external links are disabled', () => {
        mockMetadataService.getPropertyIcon.mockImplementation(() => 'star');

        const markup = renderPillRows({
            file: createTestTFile('Notes/Links.md'),
            isCompactMode: false,
            tags: [],
            properties: [
                {
                    fieldKey: 'Reference',
                    value: '[GitHub issue](https://github.com/johansan/notebook-navigator/issues/935)',
                    valueKind: 'string'
                }
            ],
            wordCount: null,
            settings: {
                ...DEFAULT_SETTINGS,
                showFileProperties: true,
                enablePropertyExternalLinks: false,
                propertyIcons: { reference: 'star' }
            },
            visiblePropertyKeys: new Set<string>(['reference']),
            visibleNavigationPropertyKeys: new Set<string>()
        });

        expect(markup).not.toContain('data-icon-id="external-link"');
        expect(markup).toContain('data-icon-id="star"');
        expect(mockMetadataService.getPropertyIcon).toHaveBeenCalled();
    });
});
