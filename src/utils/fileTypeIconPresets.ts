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

export const DEFAULT_FILE_TYPE_ICON_PRESET = 'none';

export const FILE_TYPE_ICON_PROVIDER_PRESET_IDS = [
    'bootstrap-icons',
    'fontawesome-solid',
    'material-icons',
    'phosphor',
    'rpg-awesome'
] as const;

export const FILE_TYPE_ICON_PRESET_IDS = [DEFAULT_FILE_TYPE_ICON_PRESET, ...FILE_TYPE_ICON_PROVIDER_PRESET_IDS] as const;

export type FileTypeIconProviderPreset = (typeof FILE_TYPE_ICON_PROVIDER_PRESET_IDS)[number];
export type FileTypeIconPreset = (typeof FILE_TYPE_ICON_PRESET_IDS)[number];

const TEXT_EXTENSIONS = ['md', 'txt', 'rtf', 'log'] as const;
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'odt', 'pages'] as const;
const SPREADSHEET_EXTENSIONS = ['csv', 'tsv', 'xls', 'xlsx', 'ods'] as const;
const PRESENTATION_EXTENSIONS = ['ppt', 'pptx', 'odp', 'key'] as const;
const DATA_EXTENSIONS = ['json', 'yaml', 'yml', 'toml', 'xml'] as const;
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tif', 'tiff', 'heic', 'avif'] as const;
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] as const;
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm'] as const;
const ARCHIVE_EXTENSIONS = ['zip', 'rar', '7z', 'tar', 'gz'] as const;
const CODE_EXTENSIONS = [
    'js',
    'jsx',
    'ts',
    'tsx',
    'css',
    'scss',
    'html',
    'htm',
    'py',
    'java',
    'c',
    'h',
    'cpp',
    'hpp',
    'cs',
    'go',
    'rs',
    'rb',
    'php',
    'sh',
    'zsh',
    'bash',
    'sql',
    'r',
    'swift',
    'kt',
    'kts'
] as const;
const CONFIG_EXTENSIONS = ['ini', 'env', 'lock'] as const;

function createPresetMap(entries: readonly (readonly [readonly string[], string])[]): Readonly<Record<string, string>> {
    const map = Object.create(null) as Record<string, string>;

    entries.forEach(([keys, iconId]) => {
        keys.forEach(key => {
            map[key] = iconId;
        });
    });

    return Object.freeze(map);
}

const FILE_TYPE_ICON_PRESET_MAPS: Record<FileTypeIconProviderPreset, Readonly<Record<string, string>>> = {
    'bootstrap-icons': createPresetMap([
        [['md'], 'bootstrap-icons:markdown'],
        [['excalidraw.md'], 'bootstrap-icons:pencil'],
        [['canvas'], 'bootstrap-icons:easel'],
        [['base'], 'bootstrap-icons:database'],
        [['pdf'], 'bootstrap-icons:file-earmark-pdf'],
        [['doc', 'docx', 'odt', 'pages'], 'bootstrap-icons:file-earmark-richtext'],
        [['txt', 'rtf', 'log'], 'bootstrap-icons:file-earmark-text'],
        [SPREADSHEET_EXTENSIONS, 'bootstrap-icons:file-earmark-spreadsheet'],
        [PRESENTATION_EXTENSIONS, 'bootstrap-icons:file-earmark-slides'],
        [DATA_EXTENSIONS, 'bootstrap-icons:braces'],
        [IMAGE_EXTENSIONS, 'bootstrap-icons:image'],
        [AUDIO_EXTENSIONS, 'bootstrap-icons:music-note-beamed'],
        [VIDEO_EXTENSIONS, 'bootstrap-icons:play-btn'],
        [ARCHIVE_EXTENSIONS, 'bootstrap-icons:archive'],
        [CODE_EXTENSIONS, 'bootstrap-icons:code-slash'],
        [CONFIG_EXTENSIONS, 'bootstrap-icons:gear']
    ]),
    'fontawesome-solid': createPresetMap([
        [TEXT_EXTENSIONS, 'fontawesome-solid:file-lines'],
        [['excalidraw.md'], 'fontawesome-solid:pen'],
        [['canvas'], 'fontawesome-solid:draw-polygon'],
        [['base'], 'fontawesome-solid:database'],
        [['pdf'], 'fontawesome-solid:file-pdf'],
        [['doc', 'docx', 'odt', 'pages'], 'fontawesome-solid:file-word'],
        [SPREADSHEET_EXTENSIONS, 'fontawesome-solid:file-excel'],
        [PRESENTATION_EXTENSIONS, 'fontawesome-solid:file-powerpoint'],
        [['csv', 'tsv'], 'fontawesome-solid:file-csv'],
        [DATA_EXTENSIONS, 'fontawesome-solid:file-code'],
        [IMAGE_EXTENSIONS, 'fontawesome-solid:file-image'],
        [AUDIO_EXTENSIONS, 'fontawesome-solid:file-audio'],
        [VIDEO_EXTENSIONS, 'fontawesome-solid:file-video'],
        [ARCHIVE_EXTENSIONS, 'fontawesome-solid:file-zipper'],
        [CODE_EXTENSIONS, 'fontawesome-solid:file-code'],
        [CONFIG_EXTENSIONS, 'fontawesome-solid:gear']
    ]),
    'material-icons': createPresetMap([
        [['md'], 'material-icons:article'],
        [['excalidraw.md'], 'material-icons:draw'],
        [['canvas'], 'material-icons:dashboard'],
        [['base'], 'material-icons:storage'],
        [['pdf'], 'material-icons:picture_as_pdf'],
        [['doc', 'docx', 'odt', 'pages'], 'material-icons:description'],
        [['txt', 'rtf', 'log'], 'material-icons:text_snippet'],
        [SPREADSHEET_EXTENSIONS, 'material-icons:table_chart'],
        [PRESENTATION_EXTENSIONS, 'material-icons:slideshow'],
        [DATA_EXTENSIONS, 'material-icons:data_object'],
        [IMAGE_EXTENSIONS, 'material-icons:image'],
        [AUDIO_EXTENSIONS, 'material-icons:audio_file'],
        [VIDEO_EXTENSIONS, 'material-icons:video_file'],
        [ARCHIVE_EXTENSIONS, 'material-icons:folder_zip'],
        [CODE_EXTENSIONS, 'material-icons:code'],
        [CONFIG_EXTENSIONS, 'material-icons:settings']
    ]),
    phosphor: createPresetMap([
        [TEXT_EXTENSIONS, 'phosphor:text-aa'],
        [['md'], 'phosphor:markdown-logo'],
        [['excalidraw.md'], 'phosphor:note-pencil'],
        [['canvas'], 'phosphor:layout'],
        [['base'], 'phosphor:database'],
        [DOCUMENT_EXTENSIONS, 'phosphor:article'],
        [SPREADSHEET_EXTENSIONS, 'phosphor:table'],
        [PRESENTATION_EXTENSIONS, 'phosphor:presentation-chart'],
        [DATA_EXTENSIONS, 'phosphor:brackets-curly'],
        [IMAGE_EXTENSIONS, 'phosphor:image'],
        [AUDIO_EXTENSIONS, 'phosphor:music-note'],
        [VIDEO_EXTENSIONS, 'phosphor:video'],
        [ARCHIVE_EXTENSIONS, 'phosphor:archive'],
        [CODE_EXTENSIONS, 'phosphor:code'],
        [CONFIG_EXTENSIONS, 'phosphor:gear']
    ]),
    'rpg-awesome': createPresetMap([
        [TEXT_EXTENSIONS, 'rpg-awesome:book'],
        [['excalidraw.md'], 'rpg-awesome:quill-ink'],
        [['canvas'], 'rpg-awesome:crystal-ball'],
        [['base'], 'rpg-awesome:gears'],
        [DOCUMENT_EXTENSIONS, 'rpg-awesome:scroll-unfurled'],
        [SPREADSHEET_EXTENSIONS, 'rpg-awesome:cog-wheel'],
        [PRESENTATION_EXTENSIONS, 'rpg-awesome:crystal-wand'],
        [DATA_EXTENSIONS, 'rpg-awesome:cubes'],
        [IMAGE_EXTENSIONS, 'rpg-awesome:mirror'],
        [AUDIO_EXTENSIONS, 'rpg-awesome:ringing-bell'],
        [VIDEO_EXTENSIONS, 'rpg-awesome:player'],
        [ARCHIVE_EXTENSIONS, 'rpg-awesome:ammo-bag'],
        [CODE_EXTENSIONS, 'rpg-awesome:gear-hammer'],
        [CONFIG_EXTENSIONS, 'rpg-awesome:locked-fortress']
    ])
};

export function isFileTypeIconPreset(value: unknown): value is FileTypeIconPreset {
    return typeof value === 'string' && FILE_TYPE_ICON_PRESET_IDS.includes(value as FileTypeIconPreset);
}

export function isFileTypeIconProviderPreset(value: unknown): value is FileTypeIconProviderPreset {
    return typeof value === 'string' && FILE_TYPE_ICON_PROVIDER_PRESET_IDS.includes(value as FileTypeIconProviderPreset);
}

export function getFileTypeIconPresetMap(preset: FileTypeIconPreset): Readonly<Record<string, string>> | null {
    if (!isFileTypeIconProviderPreset(preset)) {
        return null;
    }

    return FILE_TYPE_ICON_PRESET_MAPS[preset];
}
