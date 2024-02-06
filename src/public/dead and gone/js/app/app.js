import * as Syrenity from 'syrenity';
import general_new from '../general_new.js';
import { loadGuilds, refresh } from './guildBar.js';
import { loadAll as loadAllTooltips } from '../ui/tooltip.js';
import '../ui/contextMenus.js';
import contentManager from './contentManager.js';
import { registerContextMenu } from '../ui/contextMenus.js';
import ColorThief from '../lib/color-thief.mjs';
import showUserSettingsPage from './pages/userSettings.js';
import { InputManager } from './inputManager.js';
import * as directMessageManager from './directMessageManager.js';
import enlargeImage from '../ui/imageEnlarger.js';
import { updateUI } from './basicUI.js';
import loadGuild from './guildLoader.js';
const baseURL = `${location.hostname}${location.port ? `:${location.port}` : ""}`;
const client = new Syrenity.Client({
    baseURL,
    apiURL: baseURL + "/api",
    useSecure: location.protocol.includes("s")
});
updateUI();
document.addEventListener("DOMContentLoaded", async () => {
    // @ts-ignore
    // Setup basic UI
    loadAllTooltips();
    updateUI();
    document.getElementById("add-server-button").onclick = () => {
        addServer();
    };
    document.getElementById("dms-button").onclick = () => {
        directMessageManager.loadRelationshipList();
    };
    registerContextMenu({
        attachTo: document.getElementById("guild-bar-control-settings"),
        recordPrimaryMouse: true,
        items: [
            {
                danger: true,
                content: "Logout",
                click: (context) => {
                    location.href = "/logout";
                }
            },
            {
                type: "seperator"
            },
            {
                content: "Settings...",
                icon: "settings",
                click: async () => {
                    showUserSettingsPage();
                }
            }
        ]
    });
    //pageManager.showPage("user_settings");
    // Listen for client events
    client.on("debug", (message) => {
        console.log(message);
    });
    client.on("ready", (data) => {
        document.getElementById("user-avatar").setAttribute("src", data.user.avatar);
        document.getElementById("user-avatar").onclick = () => {
            showUserDiv(client.currentUser, document.getElementById("user-avatar"));
        };
        loadGuilds(data.guilds);
        finishedLoading();
    });
    client.on("disconnect", () => {
        setLoading();
    });
    client.on("reconnect", () => {
        finishedLoading();
    });
    client.on("reconnectionFailure", () => {
        location.reload();
    });
    client.on("messageCreate", async (message) => {
        console.log("loading message", message);
        await contentManager.loadMessage(message);
        if (message.author.id !== client.currentUser.id)
            new Audio("/public/audio/notification.mp3").play();
    });
    client.on("messageDelete", messaegId => {
        const messageEl = document.getElementById(`message-${messaegId}`);
        messageEl.parentElement.removeChild(messageEl);
    });
    client.on("channelCreate", async (channel) => {
        console.log(channel);
        loadGuild(await channel.guild.fetch(), true);
    });
    client.on("typingStart", (data) => {
        InputManager.handleTyping(data);
    });
    // Login to client
    client.login("");
});
function finishedLoading() {
    document.getElementById("fullscreen-loader").style.display = "none";
}
function setLoading() {
    document.getElementById("fullscreen-loader").style.display = "block";
}
export { client };
export async function showUserDiv(user, element) {
    setTimeout(() => {
        const container = document.getElementById("user-profile-container");
        document.getElementById("user-profile-avatar").src = user.avatar;
        document.getElementById("user-profile-created-at").innerHTML = user.createdAt.toLocaleString("default", { month: 'long', day: 'numeric', year: 'numeric' });
        document.getElementById("user-profile-username").innerHTML = `${user.username}#${user.discriminator}`;
        document.getElementById("user-profile-avatar").onclick = () => {
            enlargeImage(document.getElementById("user-profile-avatar").src);
        };
        const colorThief = new ColorThief();
        let cancelThief = false;
        element.crossOrigin = "Anonymous";
        const fix = () => {
            cancelThief = true;
            let color = general_new.avatar.setNoAvatarIcon(user.id, document.getElementById("user-profile-avatar"));
            document.getElementById("user-profile-header").style.backgroundColor = color;
        };
        if (!user.avatar)
            fix();
        const updateColor = (data) => {
            document.getElementById("user-profile-header").style.backgroundColor = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
        };
        if (element.complete && cancelThief == false) {
            updateColor(colorThief.getColor(element));
        }
        else if (cancelThief == false) {
            element.addEventListener('load', function () {
                if (cancelThief)
                    return;
                updateColor(colorThief.getColor(element));
            });
        }
        container.style.display = "block";
        let coordinates = general_new.coordinates.getFor(element);
        coordinates.x += element.offsetWidth;
        coordinates = general_new.coordinates.bound(coordinates.x, coordinates.y, container);
        container.style.left = coordinates.x + "px";
        container.style.top = coordinates.y + "px";
        let reEnable = () => {
            document.body.addEventListener("click", (e) => {
                if (container.contains(e.target)) {
                    return reEnable();
                }
                document.getElementById("user-profile-container").style.display = "none";
            }, { once: true });
        };
        setTimeout(() => {
            reEnable();
        }, 100);
    }, 100);
}
function addServer() {
    // Show modal
    general_new.modals.showModal("add_server", {
        handleIDs: (keys) => {
            const inviteCodeElement = keys["invite-code"];
            // Join button clicked
            keys["join"].onclick = async () => {
                try {
                    await client.guilds.join(inviteCodeElement.value);
                    location.reload();
                }
                catch (err) {
                    if (err.message)
                        general_new.alerts.error(`${err.message}`, "Failed to join server");
                    else
                        general_new.alerts.error(`This is a placeholder message: ${JSON.stringify(err.rawData || err.rawResponse || { unknown: "unknown" })}`, "Failed to join server");
                }
            };
            // Create button clicked
            keys["create"].onclick = () => {
                createServer();
            };
        }
    });
}
function createServer() {
    // Show modal
    general_new.modals.showModal("create_server", {
        handleIDs: (keys) => {
            // Add listener for create
            keys["create"].onclick = async () => {
                // Gather data
                const name = keys["server-name"].value;
                const avatar = keys["avatar"].src.split(",")[1];
                const uploadedAvatar = keys["avatar"].hasAttribute("data-modal-upload-success");
                try {
                    await client.guilds.create(name, avatar);
                    refresh();
                }
                catch (err) {
                    return alert(JSON.stringify(err));
                }
            };
        }
    });
}
export function parseUrl() {
    let parts = location.pathname.match(/^(\/channels\/(@me|[0-9]+)\/([0-9]+))$/);
    return {
        guild: !parts || !parts[2] ? null : parts[2] === "@me" ? "@me" : parseInt(parts[2]),
        channel: !parts || !parts[3] ? null : parseInt(parts[3]) || null
    };
}
