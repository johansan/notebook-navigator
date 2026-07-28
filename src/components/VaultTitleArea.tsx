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
import { useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useVaultProfileMenu } from '../hooks/useVaultProfileMenu';
import { strings } from '../i18n';
import { usesMobileChrome } from '../utils/paneLayout';
import { resolveUXIcon } from '../utils/uxIcons';
import { ServiceIcon } from './ServiceIcon';

export const VaultTitleArea = React.memo(function VaultTitleArea() {
    const { plugin } = useServices();
    const settings = useSettingsState();

    const { hasProfiles, hasMultipleProfiles, activeProfileName, handleTriggerClick, handleTriggerKeyDown } = useVaultProfileMenu({
        plugin,
        vaultProfiles: settings.vaultProfiles ?? [],
        activeProfileId: settings.vaultProfile
    });

    // Phones render the profile trigger inside the mobile chrome header instead.
    if (usesMobileChrome() || !hasProfiles || !hasMultipleProfiles) {
        return null;
    }

    return (
        <div className="nn-vault-title-area">
            <div
                className="nn-vault-title-content nn-vault-title-trigger"
                aria-label={strings.navigationPane.profileMenuAria}
                role="button"
                tabIndex={0}
                onClick={handleTriggerClick}
                onKeyDown={handleTriggerKeyDown}
            >
                <span className="nn-vault-title-text">{activeProfileName}</span>
                <ServiceIcon
                    className="nn-vault-title-chevron"
                    iconId={resolveUXIcon(settings.interfaceIcons, 'nav-profile-chevron')}
                    aria-hidden={true}
                />
            </div>
        </div>
    );
});
