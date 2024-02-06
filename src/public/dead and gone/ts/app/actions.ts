import * as Syrenity from 'syrenity';
import general from '../general_new.js';
import { client } from './app.js';

export function deleteMessage(message: Syrenity.Message) {
  fetch(`/api/channels/${message.channel.id}/messages/${message.id}`, {
    method: "DELETE"
  }).then(async res => {
    const text = await res.text();
    let json: {[key: string]: any} = {};

    try { json = JSON.parse(text); } catch {};

    // Check if it was OK
    if (!res.ok) {
      return general.alerts.error(`${json?.message || `Unknown error (${res.status} ${res.statusText})`}`, "Failed to delete message!");
    }
  });
}