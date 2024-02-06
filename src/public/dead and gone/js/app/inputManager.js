import * as Syrenity from 'syrenity';
import ContentManager from './contentManager.js';
import { client } from './app.js';
import general from '../general_new.js';
const managers = new Map();
let activeManager = null;
const input = document.getElementById("input-input");
document.addEventListener("DOMContentLoaded", () => {
    // Listen for keydown
    input.addEventListener("keyup", (e) => {
        if (activeManager && !e.shiftKey) {
            activeManager.handleKeydown(e);
        }
    });
    setInterval(() => {
        if (activeManager)
            activeManager.renderTyping();
    }, 1500);
});
export class InputManager {
    draft = "";
    channel;
    typing = new Map();
    lastSentTyping = 0;
    constructor(channel) {
        this.channel = channel;
    }
    handleKeydown(e) {
        // Check for special keys
        if (e.key == "Enter") {
            this.sendMessage();
            return;
        }
        if (this.draft != input.value && e.key != "Enter") {
            if (2500 - (Date.now() - this.lastSentTyping) < 0) {
                this.lastSentTyping = Date.now();
                this.channel.startTyping();
            }
        }
        // Update draft
        this.draft = input.value;
    }
    load() {
        input.value = this.draft;
        activeManager = this;
        input.focus();
        this.renderTyping();
    }
    renderTyping() {
        if (activeManager !== this)
            return;
        let typing = [];
        let others = 0;
        this.typing.forEach((value, key) => {
            // Check if it has expired
            if (3000 - (Date.now() - value.startedAt) < 0) {
                this.typing.delete(key);
                return;
            }
            // Check if self
            if (value.user.id === client.currentUser.id)
                return;
            if (typing.length === 3)
                others++;
            else
                typing.push(value.user.username);
        });
        let text = "";
        // Actually create the message
        for (let i in typing) {
            text += typing[i];
            // Add the and's and comma's 
            if (typing.length == 1)
                continue;
            else if (parseInt(i) == typing.length - 2 && !others)
                text += " and ";
            else if (parseInt(i) != typing.length - 1)
                text += ", ";
        }
        // If there are other's add them
        if (others) {
            text += ` and ${others} others`;
        }
        // Correct and/is etc.
        if (typing.length != 0) {
            if (typing.length != 1)
                text += " are typing";
            else
                text += " is typing";
            text += "...";
        }
        if (text === "")
            text = "&nbsp;";
        document.getElementById("current-typing").innerHTML = text;
    }
    async sendMessage() {
        // Get details
        const content = this.draft;
        this.draft = "";
        input.value = "";
        // Create dummy message
        const id = 0 - Math.floor(Math.random() * 1000000);
        const dummy = new Syrenity.Message(id, this.channel.id, client, {
            content,
            id: id,
            channel_id: this.channel.id,
            is_edited: false,
            is_pinned: false,
            is_system: false,
            author_id: client.currentUser.id,
            created_at: Date.now()
        });
        // Add dummy message
        await ContentManager.loadMessage(dummy, true);
        // Try send message
        try {
            // Send the message
            await this.channel.messages.create(content);
            // Delete dummy message
            document.getElementById(`message-${id}`).parentNode.removeChild(document.getElementById(`message-${id}`));
        }
        catch (err) {
            if (err instanceof Syrenity.HTTPError) {
                general.alerts.error(`We couldn't send your message as an error occurred!<br><br>${err.message}`, "Oops!");
            }
        }
    }
    static async handleTyping(event) {
        const channelId = event.channel.id;
        // Check if input is loaded
        if (managers.has(channelId)) {
            const manager = managers.get(channelId);
            manager.typing.set(event.user.id, {
                user: await event.user.fetch(),
                channel: event.channel,
                startedAt: Date.now()
            });
            manager.renderTyping();
        }
    }
    static async removeTyping(forUser, inChannel) {
        if (managers.has(inChannel)) {
            const manager = managers.get(inChannel);
            manager.typing.delete(forUser);
            manager.renderTyping();
        }
    }
}
export default {
    loadManager: (channel) => {
        // Check if manager already exists
        if (!managers.has(channel.id)) {
            const manager = new InputManager(channel);
            managers.set(channel.id, manager);
        }
        // Get the manager
        const manager = managers.get(channel.id);
        manager.load();
    }
};
