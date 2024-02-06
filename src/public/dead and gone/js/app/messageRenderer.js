import { registerTooltip } from '../ui/tooltip.js';
import templates from './contextMenuTemplates.js';
import enlargeImage from '../ui/imageEnlarger.js';
import { registerContextMenu } from '../ui/contextMenus.js';
import { showUserDiv } from './app.js';
import general from '../general_new.js';
enlargeImage;
import { showdown } from '../lib/showdown.js';
import contextMenuTemplates from './contextMenuTemplates.js';
const markdownConverter = new showdown.Converter({
    strikethrough: true,
    noHeaderId: true,
    simplifiedAutoLink: true,
    customizedHeaderId: false,
    underline: true,
});
const proxy = `${location.protocol}//${location.host}/api/proxy/image?url=`;
export async function renderMessage(message, skipUser = false) {
    // Fetch the author
    const messageAuthor = await message.author.fetch();
    // Create message container
    const container = document.createElement("div");
    container.classList.add("message-container");
    container.id = `message-${message.id}`;
    if (!skipUser) {
        // Add PFP
        const pfp = document.createElement("img");
        if (!messageAuthor.avatar)
            general.avatar.setNoAvatarIcon(messageAuthor.id, pfp);
        else
            pfp.src = messageAuthor.avatar;
        pfp.classList.add("base-image");
        pfp.classList.add("message-pfp");
        container.appendChild(pfp);
        pfp.onclick = () => {
            console.log(messageAuthor, 2);
            showUserDiv(messageAuthor, pfp);
        };
        registerContextMenu({
            attachTo: pfp,
            items: [
                {
                    content: "Copy User ID",
                    icon: "copy",
                    click: () => {
                        navigator.clipboard.writeText(message.author.id.toString());
                    }
                }
            ]
        });
    }
    else {
        const timestamp = document.createElement("label");
        timestamp.innerHTML = "";
        timestamp.classList.add("message-short-pfp");
        container.appendChild(timestamp);
        container.addEventListener("mouseenter", () => {
            timestamp.innerHTML = message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        container.addEventListener("mouseleave", () => {
            timestamp.innerHTML = "";
        });
        container.classList.add("message-container-short");
    }
    // Add Content
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("message-content-container");
    container.appendChild(contentContainer);
    if (!skipUser) {
        const messageHeader = document.createElement("div");
        messageHeader.classList.add("message-header");
        contentContainer.appendChild(messageHeader);
        // Add Title
        const author = document.createElement("label");
        author.classList.add("message-author");
        author.innerHTML = generateUsername(messageAuthor, {
            isOwner: false
        });
        messageHeader.appendChild(author);
        // Add timestamp
        const timestamp = document.createElement("small");
        timestamp.classList.add("message-timestamp");
        timestamp.innerHTML = general.time.getRelativeString(message.createdAt);
        messageHeader.appendChild(timestamp);
    }
    // Add content
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    messageContent.innerHTML = markdownConverter.makeHtml(escapeHtml(message.content).replace(/\n/g, "<br>"));
    contentContainer.appendChild(messageContent);
    if (skipUser)
        messageContent.classList.add("message-content-short");
    // Check if it is dummy
    if (message.id < 0) {
        contentContainer.classList.add("dummy-message");
    }
    // Generaete images
    const images = await scanForImages(message);
    // Add images
    for (const i in images) {
        messageContent.appendChild(images[i]);
    }
    // Register context menu
    templates.message(message, container);
    return container;
}
async function scanForImages(message) {
    const images = message.content.match(/https?:\/\/[^ ]+\.(png|jpe?g|gif|webp)/g);
    const imageArray = [];
    for (const i in images)
        imageArray.push(images[i]);
    const imageElements = [];
    // Loop through images
    for (const image of imageArray) {
        // Try to fetch it
        try {
            let fetchedImage = await fetch(`${proxy}${image}`, {
                method: "HEAD"
            });
            console.log(fetchedImage);
            if (fetchedImage.ok) {
                // Create element
                const imageElement = document.createElement("img");
                imageElement.src = `${proxy}${image}`;
                imageElement.classList.add("message-image");
                imageElements.push(imageElement);
                // Add onclick expansion
                imageElement.onclick = () => {
                    enlargeImage(imageElement.src);
                };
                contextMenuTemplates.expandImage(imageElement.src, imageElement);
                registerTooltip({
                    attachTo: imageElement,
                    flyout: "down",
                    content: image,
                    followMouseX: true,
                    hoverFor: 1000
                });
            }
        }
        catch {
        }
    }
    return imageElements;
}
function generateUsername(user, data) {
    let string = `${user.username}`;
    // Check if bot
    if (user.isBot)
        string += `<label class="message-tag">Bot</label>`;
    if (data.isOwner)
        string += `<label class="message-tag">Owner</label>`;
    return string;
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
