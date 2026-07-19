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
import type { IconAssetRecord } from '../../src/services/icons/external/IconAssetDatabase';
import { BaseFontIconProvider } from '../../src/services/icons/providers/BaseFontIconProvider';
import { setIconRenderToken } from '../../src/services/icons/providers/providerUtils';

interface FakeFontEnvironment {
    document: Document;
    faces: Set<FontFace>;
    instances: FontFace[];
    resolveLoad: () => void;
    dispatchPageHide: () => void;
}

interface FakeContainer {
    element: HTMLElement;
    classes: Set<string>;
    getText: () => string;
}

class TestFontIconProvider extends BaseFontIconProvider {
    readonly id = 'test-font';
    readonly name = 'Test font';

    protected parseMetadata(): void {
        this.setIconData([{ id: 'camera', displayName: 'Camera' }], new Map([['camera', { unicode: 'f220', keywords: ['camera'] }]]));
    }

    protected getCssClass(): string {
        return 'nn-iconfont-test';
    }
}

function createRecord(): IconAssetRecord {
    return {
        id: 'test-font',
        version: '1.0.0',
        mimeType: 'font/woff2',
        data: new ArrayBuffer(8),
        metadataFormat: 'json',
        metadata: '{}',
        updated: 1
    };
}

function createFontEnvironment(loadImmediately: boolean): FakeFontEnvironment {
    const faces = new Set<FontFace>();
    const instances: FontFace[] = [];
    const pageHideListeners = new Set<EventListenerOrEventListenerObject>();
    let resolvePendingLoad: (() => void) | null = null;

    class FakeFontFace {
        readonly family: string;
        status: FontFaceLoadStatus;
        private readonly loadPromise: Promise<FontFace>;

        constructor(family: string) {
            this.family = family;
            this.status = loadImmediately ? 'loaded' : 'loading';
            this.loadPromise = loadImmediately
                ? Promise.resolve(this as unknown as FontFace)
                : new Promise(resolve => {
                      resolvePendingLoad = () => {
                          this.status = 'loaded';
                          resolve(this as unknown as FontFace);
                      };
                  });
            instances.push(this as unknown as FontFace);
        }

        load(): Promise<FontFace> {
            return this.loadPromise;
        }
    }

    const fontSet = {
        status: 'loaded',
        add: (fontFace: FontFace) => {
            faces.add(fontFace);
        },
        delete: (fontFace: FontFace) => faces.delete(fontFace),
        has: (fontFace: FontFace) => faces.has(fontFace),
        forEach: (callback: (fontFace: FontFace) => void) => {
            faces.forEach(callback);
        }
    };
    const documentWindow = {
        FontFace: FakeFontFace,
        getComputedStyle: () => ({ fontFamily: 'NotebookNavigatorTestFont, sans-serif' }),
        opener: null,
        addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
            if (type === 'pagehide') {
                pageHideListeners.add(listener);
            }
        },
        removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
            if (type === 'pagehide') {
                pageHideListeners.delete(listener);
            }
        }
    } as unknown as Window & typeof window;
    const document = {
        defaultView: documentWindow,
        fonts: fontSet
    } as unknown as Document;

    return {
        document,
        faces,
        instances,
        resolveLoad: () => {
            resolvePendingLoad?.();
        },
        dispatchPageHide: () => {
            pageHideListeners.forEach(listener => {
                if (typeof listener === 'function') {
                    listener(new Event('pagehide'));
                } else {
                    listener.handleEvent(new Event('pagehide'));
                }
            });
        }
    };
}

function createContainer(document: Document): FakeContainer {
    const classes = new Set<string>();
    let text = '';
    const styles = new Map<string, string>();
    const element = {
        ownerDocument: document,
        classList: classes,
        style: {
            set fontSize(value: string) {
                styles.set('font-size', value);
            },
            set width(value: string) {
                styles.set('width', value);
            },
            set height(value: string) {
                styles.set('height', value);
            },
            set lineHeight(value: string) {
                styles.set('line-height', value);
            },
            removeProperty: (property: string) => {
                styles.delete(property);
            }
        },
        empty: () => {
            text = '';
        },
        addClass: (className: string) => {
            classes.add(className);
        },
        removeClass: (className: string) => {
            classes.delete(className);
        },
        setText: (value: string) => {
            text = value;
        }
    } as unknown as HTMLElement;

    return { element, classes, getText: () => text };
}

describe('BaseFontIconProvider', () => {
    it('creates and disposes a separate font face for each owner document', async () => {
        const firstEnvironment = createFontEnvironment(true);
        const secondEnvironment = createFontEnvironment(true);
        const provider = new TestFontIconProvider({ record: createRecord(), fontFamily: 'NotebookNavigatorTestFont' });

        await provider.prepare(firstEnvironment.document);
        const firstContainer = createContainer(firstEnvironment.document);
        const secondContainer = createContainer(secondEnvironment.document);

        expect(provider.render(firstContainer.element, 'camera')).toBe('rendered');
        expect(provider.render(secondContainer.element, 'camera')).toBe('rendered');
        expect(provider.render(createContainer(secondEnvironment.document).element, 'camera')).toBe('rendered');

        expect(firstEnvironment.instances).toHaveLength(1);
        expect(secondEnvironment.instances).toHaveLength(1);
        expect(firstEnvironment.faces.has(firstEnvironment.instances[0])).toBe(true);
        expect(secondEnvironment.faces.has(secondEnvironment.instances[0])).toBe(true);
        expect(firstContainer.getText()).toBe(String.fromCodePoint(0xf220));
        expect(secondContainer.classes).toContain('nn-iconfont-test');

        provider.dispose();

        expect(firstEnvironment.faces.size).toBe(0);
        expect(secondEnvironment.faces.size).toBe(0);
    });

    it('waits for the owner document font before inserting a glyph', async () => {
        const environment = createFontEnvironment(false);
        const provider = new TestFontIconProvider({ record: createRecord(), fontFamily: 'NotebookNavigatorTestFont' });
        const container = createContainer(environment.document);
        const token = Symbol('render');
        setIconRenderToken(container.element, token);

        const result = provider.render(container.element, 'camera');
        expect(result).toBeInstanceOf(Promise);
        expect(container.getText()).toBe('');

        environment.resolveLoad();
        await expect(result).resolves.toBe('rendered');
        expect(container.getText()).toBe(String.fromCodePoint(0xf220));
    });

    it('releases a document font when the owner document is hidden', async () => {
        const environment = createFontEnvironment(true);
        const provider = new TestFontIconProvider({ record: createRecord(), fontFamily: 'NotebookNavigatorTestFont' });

        await provider.prepare(environment.document);
        expect(environment.faces.size).toBe(1);

        environment.dispatchPageHide();
        expect(environment.faces.size).toBe(0);

        await provider.prepare(environment.document);
        expect(environment.instances).toHaveLength(2);
        expect(environment.faces.size).toBe(1);

        provider.dispose();
    });

    it('does not apply a completed font render after the container token changes', async () => {
        const environment = createFontEnvironment(false);
        const provider = new TestFontIconProvider({ record: createRecord(), fontFamily: 'NotebookNavigatorTestFont' });
        const container = createContainer(environment.document);
        setIconRenderToken(container.element, Symbol('first-render'));

        const result = provider.render(container.element, 'camera');
        setIconRenderToken(container.element, Symbol('replacement-render'));
        environment.resolveLoad();

        await expect(result).resolves.toBe('not-found');
        expect(container.getText()).toBe('');
    });

    it('removes a pending face and rejects readiness when disposed before parsing completes', async () => {
        const environment = createFontEnvironment(false);
        const provider = new TestFontIconProvider({ record: createRecord(), fontFamily: 'NotebookNavigatorTestFont' });
        const readiness = provider.prepare(environment.document);

        expect(environment.faces.size).toBe(1);
        provider.dispose();
        expect(environment.faces.size).toBe(0);

        const readinessExpectation = expect(readiness).rejects.toThrow('Font load completed after its document state was released');
        environment.resolveLoad();
        await readinessExpectation;
        expect(environment.faces.size).toBe(0);
    });
});
