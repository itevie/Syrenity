import { registerTooltip } from '../ui/tooltip.js';
import contentManager from './contentManager.js';
const managers = new Map();
class ChannelManager {
    id;
    ready = false;
    container = null;
    selectedChannel = null;
    constructor(guildId) {
        this.id = guildId;
    }
    setup() {
        // Create the div
        const channelContainer = document.createElement("div");
        channelContainer.classList.add("channel-container");
        this.container = channelContainer;
        // Add the title
        const channelTitle = document.createElement("div");
        channelTitle.innerHTML = "" + this.id;
        channelTitle.classList.add("channel-title");
        channelTitle.id = `channel-guild-name-${this.id}`;
        channelContainer.appendChild(channelTitle);
        // Add channel container
        const channelsContainer = document.createElement("div");
        channelsContainer.id = `channel-list-${this.id}`;
        channelsContainer.classList.add("channel-list");
        channelContainer.appendChild(channelsContainer);
        // Add to dom
        channelContainer.style.display = "none";
        document.getElementById("channel-bar").appendChild(channelContainer);
    }
    async updateGuildContent(guild) {
        const title = document.getElementById(`channel-guild-name-${this.id}`);
        title.innerHTML = guild.name;
        // Register tooltip
        registerTooltip({
            attachTo: title,
            content: guild.name,
            flyout: 'down',
            followMouseX: true,
        });
        // Load channels
        const channels = await guild.channels.fetchList();
        await this.updateChannelList(channels);
        ChannelManager.hideSkeleton();
    }
    static showSkeleton() {
        ChannelManager.hideAll();
        const skeleton = document.getElementById("channel-list-skeleton");
        const parent = skeleton.parentNode;
        // Add to bottom
        parent.removeChild(skeleton);
        parent.appendChild(skeleton);
        skeleton.style.display = "block";
    }
    static hideSkeleton() {
        document.getElementById("channel-list-skeleton").style.display = "none";
    }
    updateChannelList(channels) {
        // Clear current channels
        const channelList = document.getElementById(`channel-list-${this.id}`);
        channelList.innerHTML = "";
        // Load channels
        for (const channel of channels) {
            // Construct the name
            const channelCont = document.createElement("div");
            channelCont.id = `channel-list-item-${channel.id}`;
            channelCont.classList.add("channel-list-item");
            channelCont.innerHTML = channel.name;
            // Listen for onclick
            channelCont.onclick = async () => {
                // Fetch content manager
                let manager = contentManager.getManager(channel.id);
                // Check if it was setup
                if (manager.ready == false) {
                    manager.setup(channel);
                }
                window.history.pushState('Syrenity', 'Syrenity', `/channels/${this.id}/${channel.id}`);
                // Show content
                this.selectedChannel = channel.id;
                manager.show();
            };
            // Check if should auto click
            if (location.pathname.match(/^(\/channels\/([0-9]+)\/([0-9]+))$/)) {
                const parts = location.pathname.match(/^(\/channels\/([0-9]+)\/([0-9]+))$/);
                // Check channel
                if (channel.id == parseInt(parts[3])) {
                    channelCont.click();
                }
            }
            else {
                // Click the first channek
                window.history.pushState('Syrenity', 'Syrenity', `/channels/${this.id}/${channel.id}`);
                channelCont.click();
            }
            // Add
            channelList.appendChild(channelCont);
        }
        this.ready = true;
    }
    show() {
        ChannelManager.hideAll();
        this.container.style.display = "flex";
        if (this.selectedChannel) {
            document.getElementById(`channel-list-item-${this.selectedChannel}`).click();
        }
    }
    static hideAll() {
        // Get all elements in channel-bar
        const children = document.querySelectorAll("#channel-bar > div");
        for (let i = 0; i != children.length; i++) {
            children[i].style.display = "none";
        }
    }
}
export default {
    getManager: (guildId) => {
        if (managers.has(guildId))
            return managers.get(guildId);
        else {
            const manager = new ChannelManager(guildId);
            manager.setup();
            managers.set(guildId, manager);
            return managers.get(guildId);
        }
    },
    class: ChannelManager
};
