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

/**
 * License notices for the packages esbuild bundles into main.js, shown at the bottom of Advanced settings.
 * Their licenses require the copyright and permission notices to ship with every copy, and Obsidian installs
 * only main.js, manifest.json and styles.css, so the notices live in the plugin itself. When a bundled package
 * is added or removed, transitive ones included, update this list. The license text stays in English because
 * it is the licensors' legal text.
 */
interface MitNotice {
    /** Exact npm package names the copyright lines cover */
    packages: string[];
    copyright: string[];
}

const MIT_NOTICES: MitNotice[] = [
    {
        packages: ['marked'],
        copyright: [
            'Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/)',
            'Copyright (c) 2011-2018, Christopher Jeffrey (https://github.com/chjj/)'
        ]
    },
    {
        packages: ['react', 'react-dom', 'scheduler'],
        copyright: ['Copyright (c) Facebook, Inc. and its affiliates.']
    },
    {
        packages: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', '@dnd-kit/accessibility'],
        copyright: ['Copyright (c) 2021, Claudéric Demers']
    },
    {
        packages: ['@tanstack/react-virtual', '@tanstack/virtual-core'],
        copyright: ['Copyright (c) 2021-present Tanner Linsley']
    },
    {
        packages: ['emojilib'],
        copyright: ['Copyright (c) 2014 Mu-An Chiou']
    },
    {
        packages: ['emoji-regex-xs'],
        copyright: ['Copyright (c) 2025 Steven Levithan']
    }
];

// The MIT permission text every package above ships, identical across them apart from line wrapping
const MIT_LICENSE = [
    'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
    'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'
].join('\n\n');

// marked's license file also carries this notice, whose binary-form condition asks for it to be reproduced
const MARKDOWN_LICENSE = [
    'Copyright © 2004, John Gruber\nhttp://daringfireball.net/\nAll rights reserved.',
    'Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:',
    [
        '* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.',
        '* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.',
        '* Neither the name “Markdown” nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.'
    ].join('\n'),
    'This software is provided by the copyright holders and contributors “as is” and any express or implied warranties, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose are disclaimed. In no event shall the copyright owner or contributors be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software, even if advised of the possibility of such damage.'
].join('\n\n');

export const THIRD_PARTY_PACKAGES: readonly string[] = MIT_NOTICES.flatMap(notice => notice.packages);

export const THIRD_PARTY_LICENSES_TEXT = [
    ...MIT_NOTICES.map(notice => [notice.packages.join(', '), ...notice.copyright].join('\n')),
    `The packages above are licensed under the MIT License:\n\n${MIT_LICENSE}`,
    `marked also includes the Markdown license:\n\n${MARKDOWN_LICENSE}`
].join('\n\n');
