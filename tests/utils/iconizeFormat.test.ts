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
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
    convertIconizeToIconId,
    convertIconIdToIconize,
    normalizeCanonicalIconId,
    normalizeFileNameIconMapKey,
    normalizeFileTypeIconMapKey,
    normalizeIconMapRecord,
    parseIconMapText,
    serializeIconMapRecord,
    serializeIconForFrontmatter,
    deserializeIconFromFrontmatter,
    deserializeIconFromFrontmatterCompat
} from '../../src/utils/iconizeFormat';

const ENGLAND_FLAG_TAG_SEQUENCE = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';
const EXTERNAL_PROVIDER_METADATA: Array<{ providerId: string; relativePath: string }> = [
    { providerId: 'bootstrap-icons', relativePath: 'icon-assets/bootstrap-icons/bootstrap-icons.json' },
    { providerId: 'fontawesome-solid', relativePath: 'icon-assets/fontawesome/icons-solid.json' },
    { providerId: 'material-icons', relativePath: 'icon-assets/material-icons/icons.json' },
    { providerId: 'phosphor', relativePath: 'icon-assets/phosphor/icons.json' },
    { providerId: 'rpg-awesome', relativePath: 'icon-assets/rpg-awesome/icons.json' },
    { providerId: 'simple-icons', relativePath: 'icon-assets/simple-icons/simple-icons.json' }
];

function readProviderIconIds(relativePath: string): string[] {
    const absolutePath = path.resolve(process.cwd(), relativePath);
    const raw = JSON.parse(readFileSync(absolutePath, 'utf8')) as unknown;

    if (Array.isArray(raw)) {
        return raw.flatMap(entry => {
            if (!entry || typeof entry !== 'object' || typeof (entry as { id?: unknown }).id !== 'string') {
                return [];
            }

            return [(entry as { id: string }).id];
        });
    }

    if (!raw || typeof raw !== 'object') {
        return [];
    }

    return Object.keys(raw);
}

describe('convertIconizeToIconId', () => {
    it('converts lucide identifiers without provider prefix', () => {
        expect(convertIconizeToIconId('LiHome')).toBe('home');
    });

    it('strips redundant lucide prefix from icon names when present', () => {
        expect(convertIconizeToIconId('LiLucideUser')).toBe('user');
    });

    it('converts Font Awesome solid identifiers to fontawesome-solid provider', () => {
        expect(convertIconizeToIconId('FasUser')).toBe('fontawesome-solid:user');
    });

    it('converts Simple Icons identifiers with numeric prefixes in Iconize casing', () => {
        expect(convertIconizeToIconId('Si500px')).toBe('simple-icons:500px');
        expect(convertIconizeToIconId('Si1password')).toBe('simple-icons:1password');
    });

    it('falls back to heuristic decoding for malformed external Iconize identifiers', () => {
        expect(convertIconizeToIconId('Si500Px')).toBe('simple-icons:500px');
        expect(convertIconizeToIconId('Si1Password')).toBe('simple-icons:1password');
    });

    it('converts numeric Lucide and Bootstrap identifiers using exception aliases', () => {
        expect(convertIconizeToIconId('LiBuilding2')).toBe('building-2');
        expect(convertIconizeToIconId('BiDiagram3Fill')).toBe('bootstrap-icons:diagram-3-fill');
    });

    it('converts numeric Material Icons identifiers using exception aliases', () => {
        expect(convertIconizeToIconId('MiCrop169')).toBe('material-icons:crop_16_9');
    });

    it('converts phosphor identifiers and collapses duplicate prefixes', () => {
        expect(convertIconizeToIconId('PhAppleLogo')).toBe('phosphor:apple-logo');
        expect(convertIconizeToIconId('PhPhAppleLogo')).toBe('phosphor:apple-logo');
    });

    it('converts RPG Awesome identifiers and collapses duplicate prefixes', () => {
        expect(convertIconizeToIconId('RaHarpoonTrident')).toBe('rpg-awesome:harpoon-trident');
        expect(convertIconizeToIconId('RaRaHarpoonTrident')).toBe('rpg-awesome:harpoon-trident');
    });

    it('returns null for unsupported or invalid Iconize prefixes', () => {
        expect(convertIconizeToIconId('FarUser')).toBeNull();
        expect(convertIconizeToIconId('IbCustomIcon')).toBeNull();
        expect(convertIconizeToIconId('Li')).toBeNull();
        expect(convertIconizeToIconId('📝')).toBeNull();
    });

    it('round-trips bundled external provider identifiers through Iconize format', () => {
        EXTERNAL_PROVIDER_METADATA.forEach(({ providerId, relativePath }) => {
            readProviderIconIds(relativePath).forEach(identifier => {
                const canonical = `${providerId}:${identifier}`;
                const iconize = convertIconIdToIconize(canonical);

                expect(iconize, canonical).not.toBeNull();
                expect(convertIconizeToIconId(iconize as string), canonical).toBe(canonical);
            });
        });
    });
});

describe('convertIconIdToIconize', () => {
    it('converts default provider identifiers with explicit lucide prefix', () => {
        expect(convertIconIdToIconize('lucide-home')).toBe('LiHome');
    });

    it('converts legacy default provider identifiers without prefix', () => {
        expect(convertIconIdToIconize('home')).toBe('LiHome');
    });

    it('converts fontawesome-solid identifiers using Fas prefix', () => {
        expect(convertIconIdToIconize('fontawesome-solid:user')).toBe('FasUser');
    });

    it('converts Simple Icons identifiers that start with numbers using Iconize casing', () => {
        expect(convertIconIdToIconize('simple-icons:500px')).toBe('Si500px');
        expect(convertIconIdToIconize('simple-icons:1password')).toBe('Si1password');
    });

    it('converts phosphor identifiers without repeating provider name', () => {
        expect(convertIconIdToIconize('phosphor:apple-logo')).toBe('PhAppleLogo');
    });

    it('converts RPG Awesome identifiers without repeating provider name', () => {
        expect(convertIconIdToIconize('rpg-awesome:harpoon-trident')).toBe('RaHarpoonTrident');
    });

    it('returns null for providers without Iconize mappings', () => {
        expect(convertIconIdToIconize('emoji:📁')).toBeNull();
        expect(convertIconIdToIconize('icon-brew:custom-icon')).toBeNull();
        expect(convertIconIdToIconize('unknown-provider:icon')).toBeNull();
    });
});

describe('normalizeCanonicalIconId', () => {
    it('removes redundant lucide prefix', () => {
        expect(normalizeCanonicalIconId('lucide-sun')).toBe('sun');
    });

    it('normalizes phosphor identifiers by stripping provider prefix', () => {
        expect(normalizeCanonicalIconId('phosphor:ph-apple-logo')).toBe('phosphor:apple-logo');
    });

    it('normalizes RPG Awesome identifiers by stripping provider prefix', () => {
        expect(normalizeCanonicalIconId('rpg-awesome:ra-harpoon-trident')).toBe('rpg-awesome:harpoon-trident');
    });

    it('leaves unknown providers unchanged', () => {
        expect(normalizeCanonicalIconId('custom-pack:icon-name')).toBe('custom-pack:icon-name');
    });
});

describe('frontmatter icon helpers', () => {
    it('serializes canonical identifiers to the short slug format', () => {
        expect(serializeIconForFrontmatter('phosphor:ph-apple-logo')).toBe('ph-apple-logo');
        expect(serializeIconForFrontmatter('phosphor:file-pdf')).toBe('ph-file-pdf');
        expect(serializeIconForFrontmatter('phosphor:receipt')).toBe('ph-receipt');
        expect(serializeIconForFrontmatter('material-icons:crop_16_9')).toBe('mi-crop_16_9');
        expect(serializeIconForFrontmatter('home')).toBe('home');
    });

    it('returns bare emoji characters when serializing emoji icons', () => {
        expect(serializeIconForFrontmatter('emoji:📁')).toBe('📁');
    });

    it('returns bare keycap emoji characters when serializing emoji icons', () => {
        expect(serializeIconForFrontmatter('emoji:6️⃣')).toBe('6️⃣');
    });

    it('returns null when provider has no supported short frontmatter mapping', () => {
        expect(serializeIconForFrontmatter('icon-brew:custom-icon')).toBeNull();
        expect(serializeIconForFrontmatter('custom-pack:icon-name')).toBeNull();
        expect(serializeIconForFrontmatter('notebook-navigator-not-real-icon')).toBeNull();
    });

    it('deserializes values stored in the new frontmatter format', () => {
        expect(deserializeIconFromFrontmatter('home')).toBe('home');
        expect(deserializeIconFromFrontmatter('ph-apple-logo')).toBe('phosphor:apple-logo');
        expect(deserializeIconFromFrontmatter('ph-file-pdf')).toBe('phosphor:file-pdf');
        expect(deserializeIconFromFrontmatter('ph-receipt')).toBe('phosphor:receipt');
        expect(deserializeIconFromFrontmatter('mi-crop_16_9')).toBe('material-icons:crop_16_9');
        expect(deserializeIconFromFrontmatter('li-star')).toBe('star');
    });

    it('prefers supported Lucide slugs before short provider values', () => {
        expect(deserializeIconFromFrontmatter('ph-test')).toBe('ph-test');
    });

    it('deserializes legacy short provider values', () => {
        expect(deserializeIconFromFrontmatter('ph:apple-logo')).toBe('phosphor:apple-logo');
        expect(deserializeIconFromFrontmatter('mi:crop_16_9')).toBe('material-icons:crop_16_9');
        expect(deserializeIconFromFrontmatter('li:star')).toBe('star');
    });

    it('falls back to supported Iconize identifiers', () => {
        expect(deserializeIconFromFrontmatter('PhPhAppleLogo')).toBe('phosphor:apple-logo');
        expect(deserializeIconFromFrontmatter('LiHome')).toBe('home');
    });

    it('deserializes wikilinked vault svg paths', () => {
        expect(deserializeIconFromFrontmatter('[[_resources/icons/TokenTek_Symbol_Black.svg]]')).toBe(
            'vault:_resources/icons/TokenTek_Symbol_Black.svg'
        );
        expect(deserializeIconFromFrontmatter(' [[_resources/icons/TokenTek_Symbol_Black.svg|TokenTek]] ')).toBe(
            'vault:_resources/icons/TokenTek_Symbol_Black.svg'
        );
    });

    it('deserializes plain emoji strings into canonical emoji identifiers', () => {
        expect(deserializeIconFromFrontmatter('📁')).toBe('emoji:📁');
    });

    it('deserializes keycap emoji strings into canonical emoji identifiers', () => {
        expect(deserializeIconFromFrontmatter('6️⃣')).toBe('emoji:6️⃣');
        expect(deserializeIconFromFrontmatter('#️⃣')).toBe('emoji:#️⃣');
        expect(deserializeIconFromFrontmatter('*️⃣')).toBe('emoji:*️⃣');
    });

    it('deserializes subdivision flag tag sequences into canonical emoji identifiers', () => {
        expect(deserializeIconFromFrontmatter(ENGLAND_FLAG_TAG_SEQUENCE)).toBe(`emoji:${ENGLAND_FLAG_TAG_SEQUENCE}`);
    });

    it('ignores unsupported or unrecognized stored values', () => {
        expect(deserializeIconFromFrontmatter('phosphor:ph-apple-logo')).toBeNull();
        expect(deserializeIconFromFrontmatter('rpg-awesome:ra-harpoon-trident')).toBeNull();
        expect(deserializeIconFromFrontmatter('lucide-sun')).toBeNull();
        expect(deserializeIconFromFrontmatter('FarUser')).toBeNull();
        expect(deserializeIconFromFrontmatter('ri:alarm-warning-line')).toBeNull();
        expect(deserializeIconFromFrontmatter('li:not-a-real-icon')).toBeNull();
        expect(deserializeIconFromFrontmatter('notebook-navigator-not-real-icon')).toBeNull();
    });

    it('deserializes legacy provider-prefixed emoji values with compat helper', () => {
        expect(deserializeIconFromFrontmatterCompat('emoji:🔭')).toBe('emoji:🔭');
    });

    it('deserializes legacy provider-prefixed keycap emoji values with compat helper', () => {
        expect(deserializeIconFromFrontmatterCompat('emoji:6️⃣')).toBe('emoji:6️⃣');
    });

    it('serializes and deserializes subdivision flag tag sequences with compat helper', () => {
        const canonical = `emoji:${ENGLAND_FLAG_TAG_SEQUENCE}`;
        expect(serializeIconForFrontmatter(canonical)).toBe(ENGLAND_FLAG_TAG_SEQUENCE);
        expect(deserializeIconFromFrontmatterCompat(canonical)).toBe(canonical);
    });
});

describe('icon map examples', () => {
    it('uses icons that exist in the bundled Phosphor metadata', () => {
        const phosphorIconIds = new Set(readProviderIconIds('icon-assets/phosphor/icons.json'));

        expect(phosphorIconIds.has('calendar')).toBe(true);
        expect(phosphorIconIds.has('receipt')).toBe(true);
        expect(phosphorIconIds.has('file-code')).toBe(true);
        expect(phosphorIconIds.has('file-pdf')).toBe(true);
    });
});

describe('parseIconMapText', () => {
    it('normalizes mapping values to frontmatter icon values', () => {
        const parsed = parseIconMapText('pdf=SiGithub', normalizeFileTypeIconMapKey);
        expect(parsed.invalidLines).toEqual([]);
        expect(parsed.map.pdf).toBe('si-github');
    });

    it('accepts preferred short provider icon values for file type mappings', () => {
        const parsed = parseIconMapText('cpp=ph-file-code\npdf=ph-file-pdf', normalizeFileTypeIconMapKey);

        expect(parsed.invalidLines).toEqual([]);
        expect(parsed.map.cpp).toBe('ph-file-code');
        expect(parsed.map.pdf).toBe('ph-file-pdf');
    });

    it('accepts preferred short provider icon values for file name mappings', () => {
        const parsed = parseIconMapText('meeting=ph-calendar\ninvoice=ph-receipt', normalizeFileNameIconMapKey);

        expect(parsed.invalidLines).toEqual([]);
        expect(parsed.map.meeting).toBe('ph-calendar');
        expect(parsed.map.invoice).toBe('ph-receipt');
    });

    it('preserves plain emoji mapping values', () => {
        const parsed = parseIconMapText('pdf=📁', normalizeFileTypeIconMapKey);
        expect(parsed.invalidLines).toEqual([]);
        expect(parsed.map.pdf).toBe('📁');
    });

    it('marks unknown Iconize-style identifiers as invalid', () => {
        const parsed = parseIconMapText('pdf=Si', normalizeFileTypeIconMapKey);
        expect(parsed.map.pdf).toBeUndefined();
        expect(parsed.invalidLines).toEqual(['pdf=Si']);
    });

    it('supports single-quoted file name keys with spaces', () => {
        const parsed = parseIconMapText("'AI '=brain", normalizeFileNameIconMapKey);
        expect(parsed.invalidLines).toEqual([]);
        expect(parsed.map['ai ']).toBe('brain');
    });

    it('canonicalizes NFC and NFD-equivalent file name keys to the same identifier', () => {
        const parsed = parseIconMapText("'Cafe\u0301'=brain\n'Café'=calendar", normalizeFileNameIconMapKey);
        expect(parsed.invalidLines).toEqual([]);
        expect(Object.keys(parsed.map)).toEqual(['café']);
        expect(parsed.map.café).toBe('calendar');
    });
});

describe('normalizeIconMapRecord', () => {
    it('normalizes known icons and keeps values that name no known icon', () => {
        const normalized = normalizeIconMapRecord(
            { '.PDF': 'SiGithub', md: 'CI-simple-icons-obsidian', txt: '  ', '': 'home' },
            normalizeFileTypeIconMapKey
        );

        expect(normalized).toEqual({ pdf: 'si-github', md: 'CI-simple-icons-obsidian' });
    });
});

describe('serializeIconMapRecord', () => {
    it('wraps keys containing whitespace in single quotes', () => {
        const text = serializeIconMapRecord({ 'ai ': 'brain', meeting: 'calendar' });
        expect(text).toBe("'ai '=brain\nmeeting=calendar");
        expect(parseIconMapText(text, normalizeFileNameIconMapKey).map['ai ']).toBe('brain');
    });

    it("wraps keys starting with '#'", () => {
        const text = serializeIconMapRecord({ '#inbox': 'calendar' });
        expect(text).toBe("'#inbox'=calendar");
        expect(parseIconMapText(text, normalizeFileNameIconMapKey).map['#inbox']).toBe('calendar');
    });
});
