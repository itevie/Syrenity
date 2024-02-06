import general from '../general_new.js';
export function deleteMessage(message) {
    fetch(`/api/channels/${message.channel.id}/messages/${message.id}`, {
        method: "DELETE"
    }).then(async (res) => {
        const text = await res.text();
        let json = {};
        try {
            json = JSON.parse(text);
        }
        catch { }
        ;
        // Check if it was OK
        if (!res.ok) {
            return general.alerts.error(`${json?.message || `Unknown error (${res.status} ${res.statusText})`}`, "Failed to delete message!");
        }
    });
}
