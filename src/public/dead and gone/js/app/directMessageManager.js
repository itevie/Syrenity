import channelManager from './channelManager.js';
import contentManager from './contentManager.js';
import { client, parseUrl, showUserDiv } from "./app.js";
import general from '../general_new.js';
import { registerContextMenu } from '../ui/contextMenus.js';
export async function loadRelationshipList() {
    // Cleanup
    channelManager.class.hideAll();
    channelManager.class.showSkeleton();
    contentManager.hideAll();
    const relationships = await client.dms.fetchList();
    const container = document.getElementById("channel-list-@me");
    container.innerHTML = "";
    // Add the add friend button
    const addFriendContainer = document.createElement("div");
    addFriendContainer.classList.add("channel-list-me-item");
    const p = document.createElement("img");
    p.src = `/public/images/icons/add.png`;
    const n = document.createElement("label");
    n.innerHTML = `Add Friend`;
    addFriendContainer.appendChild(p);
    addFriendContainer.appendChild(n);
    container.appendChild(addFriendContainer);
    // Add frient onclick
    addFriendContainer.onclick = () => {
    };
    for await (const relationship of relationships) {
        console.log("loading...");
        const recipient = await relationship.fetchRecipient();
        const user = await recipient.fetch();
        const item = document.createElement("div");
        item.id = "channel-list-@me-item-" + relationship.channel.id;
        item.classList.add(`channel-list-me-item`);
        const pfp = document.createElement("img");
        pfp.src = user.avatar;
        pfp.onerror = () => {
            general.avatar.setNoAvatarIcon(user.id, pfp);
        };
        const name = document.createElement("label");
        name.innerHTML = user.username;
        const channel = await relationship.channel.fetch();
        channel.name = `${user.username}`;
        // Listen for onclick
        item.onclick = async () => {
            // Fetch content manager
            let manager = contentManager.getManager(relationship.channel.id);
            // Check if it was setup
            if (manager.ready == false) {
                manager.setup(channel);
            }
            window.history.pushState('Syrenity', 'Syrenity', `/channels/@me/${relationship.channel.id}`);
            // Show content
            manager.show();
        };
        const url = parseUrl();
        if (url.channel && channel.id === url.channel) {
            item.click();
        }
        // Add context
        registerContextMenu({
            attachTo: item,
            items: [
                {
                    content: `View Profile`,
                    click: () => {
                        showUserDiv(user, item);
                    }
                },
                {
                    type: "seperator"
                },
                {
                    content: `Remove Friend`,
                    icon: "person_remove",
                    danger: true,
                },
                {
                    type: "seperator"
                },
                {
                    content: `Copy User ID`,
                    icon: "copy",
                    click: () => {
                        navigator.clipboard.writeText("" + user.id);
                    }
                }
            ]
        });
        item.appendChild(pfp);
        item.appendChild(name);
        container.appendChild(item);
    }
    // Show @me list
    document.getElementById("channel-list-@me").style.display = "block";
    channelManager.class.hideSkeleton();
}
