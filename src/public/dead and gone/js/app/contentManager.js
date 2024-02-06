import { renderMessage } from './messageRenderer.js';
import InputManager, { InputManager as InputManagerClass } from './inputManager.js';
const managers = new Map();
let selectedChannel = null;
document.addEventListener("DOMContentLoaded", () => {
});
class ContentManager {
    ready = false;
    id;
    channel;
    container;
    oldestMessageID = null;
    loadedAllMessages = false;
    disableLoading = false;
    currentScroll = 0;
    previousMessage = null;
    constructor(channelId) {
        this.id = channelId;
    }
    async setup(channel) {
        this.channel = channel;
        // Generate new channel container
        const container = document.createElement("div");
        container.id = `channel-content-${channel.id}`;
        container.style.display = "none";
        const loaderDiv = document.createElement("div");
        loaderDiv.style.margin = "30px";
        const logo = document.createElement("img");
        logo.src = `/public/images/logos/no_shape_logo.png`;
        logo.style.width = "184px";
        logo.style.display = "block";
        logo.classList.add("spin");
        loaderDiv.appendChild(logo);
        const text = document.createElement("label");
        text.innerHTML = `We're loading some messages... Give us a moment...`;
        loaderDiv.appendChild(text);
        container.onscroll = async (e) => {
            // Check if it is at the top
            const top = container.scrollTop;
            if (top < 100) {
                console.log(`Attempting to load messages for channel ${channel.id}`);
                container.firstChild.before(loaderDiv);
                loaderDiv.style.display = "block";
                await this.loadMessages(20);
                loaderDiv.style.display = "none";
            }
        };
        // Add to DOM
        document.getElementById("channel-content").appendChild(container);
        this.container = container;
        this.ready = true;
        // Fetch messages
        loaderDiv.style.display = "block";
        console.log(loaderDiv);
        container.appendChild(loaderDiv);
        await this.loadMessages(20);
        loaderDiv.style.display = "none";
    }
    update() {
        document.getElementById("content-header-title").innerHTML = this.channel.name;
        this.cleanup();
    }
    cleanup() {
        // Check to delete messages
        if (this.container.scrollHeight > 10000 && this.container.scrollTop > 1000) {
            // Clear messages at top
            this.container.firstChild.remove();
            this.cleanup();
        }
    }
    show() {
        selectedChannel = this;
        ContentManager.hideAll();
        this.update();
        this.container.style.display = "block";
        InputManager.loadManager(this.channel);
    }
    async loadMessages(amount) {
        if (this.loadedAllMessages)
            return;
        if (this.disableLoading)
            return;
        this.disableLoading = true;
        let diff = this.container.scrollHeight - this.container.scrollTop;
        // Fetch the messages
        const messages = await this.channel.messages.fetch(amount, this.oldestMessageID);
        // Reverse
        messages.reverse();
        // Check if there is no more
        if (messages.length < amount - 10) {
            this.loadedAllMessages = true;
        }
        // Render them
        const renderedElements = [];
        for (const message of messages.reverse()) {
            let group = shouldGroup(this.previousMessage, message);
            this.previousMessage = message;
            const rendered = await renderMessage(message, group);
            renderedElements.push(rendered);
            if (this.oldestMessageID == null)
                this.oldestMessageID = message.id;
            else if (this.oldestMessageID > message.id)
                this.oldestMessageID = message.id;
        }
        renderedElements.reverse();
        let i = 0;
        // Add the elements to the container
        let cont = document.getElementById(`channel-content-${this.channel.id}`);
        for (const element of renderedElements) {
            cont.appendChild(element);
            if (!cont.firstChild) {
                cont.appendChild(element);
            }
            else {
                cont.firstChild.before(element);
            }
            i++;
        }
        if (this.loadedAllMessages) {
            cont.firstChild.before(generateThisIsTheStartDiv(this.channel));
        }
        this.scrollToBottom({
            specific: this.container.scrollHeight - diff,
            force: true,
        });
        setTimeout(() => {
            this.disableLoading = false;
        }, 100);
    }
    async loadMessage(message, isDummy = false) {
        // Stop the typing
        InputManagerClass.removeTyping(message.author.id, message.channel.id);
        // Check if previous message is by same person
        let skipUser = shouldGroup(this.previousMessage, message);
        if (!isDummy)
            this.previousMessage = message;
        const rendered = await renderMessage(message, skipUser);
        let cont = document.getElementById(`channel-content-${this.channel.id}`);
        cont.appendChild(rendered);
        this.scrollToBottom();
        this.cleanup();
    }
    scrollToBottom(data = {}) {
        // Check if user is scrolled high and so it shouldn't do it
        if ((this.container.scrollHeight - this.container.scrollTop > 2000) && !data.force)
            return;
        this.container.scrollTo({
            top: data.specific ? data.specific : this.container.scrollHeight
        });
    }
    static hideAll() {
        document.getElementById("content-header-title").innerHTML = "";
        // Get all elements in channel-content
        const children = document.querySelectorAll("#channel-content > div");
        for (let i = 0; i != children.length; i++) {
            children[i].style.display = "none";
        }
    }
}
const stuff = {
    getManager: (channelId) => {
        if (managers.has(channelId))
            return managers.get(channelId);
        else {
            const manager = new ContentManager(channelId);
            managers.set(channelId, manager);
            return managers.get(channelId);
        }
    },
    loadMessage: async (message, isDummy = false) => {
        // Fetch manager
        const manager = stuff.getManager(message.channel.id);
        await manager.loadMessage(message, isDummy);
    },
    hideAll: () => {
        ContentManager.hideAll();
    },
    class: ContentManager
};
export default stuff;
function generateThisIsTheStartDiv(channel) {
    const container = document.createElement("div");
    container.style.margin = "20px";
    // Add Syrenity logo
    const logo = document.createElement("img");
    logo.src = `/public/images/logos/no_shape_logo.png`;
    logo.style.width = "184px";
    logo.style.display = "block";
    container.appendChild(logo);
    // Create text
    const text = document.createElement("h3");
    text.innerHTML = `This is the beggining of ${channel.type === "dm" ? "@" : "#"}${channel.name}!`;
    container.appendChild(text);
    container.appendChild(document.createElement("hr"));
    return container;
}
function shouldGroup(oldMessage, newMessage) {
    if (oldMessage == null)
        return false;
    if (oldMessage.author.id != newMessage.author.id)
        return false;
    if (60000 - (oldMessage.createdAt.getTime() - newMessage.createdAt.getTime()) > 0)
        return true;
    return false;
}
