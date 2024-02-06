import * as general from '../general.js';
import { registerTooltip } from '../ui/tooltip.js';
import loadGuild from './guildLoader.js';
import contextMenuTemplates from './contextMenuTemplates.js';
import * as directMessageManager from './directMessageManager.js';
import { client } from './app.js';
export function loadGuilds(guilds) {
    const sidebar = document.getElementById("guild-list");
    document.getElementById("guild-list-skeleton").style.display = "none";
    // Remove non-skeleton items
    const guildIcons = sidebar.querySelectorAll(":not(#guild-list-skeleton)");
    for (const item of guildIcons) {
        item.parentNode.removeChild(item);
    }
    // Load all guilds into the sidebar
    for (const guild of guilds) {
        // Construct guild image
        const guildImage = document.createElement("img");
        guildImage.classList.add("base-image");
        guildImage.classList.add("guild-bar-icon");
        guildImage.src = guild.avatar;
        // Add on error, replace image with a placeholder
        guildImage.onerror = () => {
            let initials = general.convertStringToInitals(guild.name);
            guildImage.src = general.generateAvatar(initials);
        };
        // Add on click to load the guild
        guildImage.onclick = async () => {
            if (location.pathname.match(/^(\/channels\/([0-9]+)\/([0-9]+))$/)) {
                if (guild.id != parseInt(location.pathname.match(/^(\/channels\/([0-9]+)\/([0-9]+))$/)[2])) {
                    window.history.pushState('Syrenity', 'Syrenity', `/channels/${guild.id}`);
                }
            }
            loadGuild(guild);
        };
        // Register context menu
        contextMenuTemplates.guild(guild, guildImage);
        // Check if should auto click
        if (location.pathname.match(/^(\/channels\/([0-9]+)\/([0-9]+))$/)) {
            const parts = location.pathname.match(/^(\/channels\/([0-9]+)\/([0-9]+))$/);
            // Check guild
            if (guild.id == parseInt(parts[2])) {
                guildImage.click();
            }
        }
        // Register tooltip
        registerTooltip({
            attachTo: guildImage,
            content: guild.name,
            flyout: 'right'
        });
        // Add to the list
        sidebar.appendChild(guildImage);
    }
    // Check if it is @me
    const url = location.pathname.match(/^(\/channels\/(@me|[0-9]+)\/([0-9]+))$/);
    if (url && url[2] && url[2] === "@me")
        directMessageManager.loadRelationshipList();
}
export async function refresh() {
    const guilds = await client.guilds.fetchList();
    loadGuilds(guilds);
}
