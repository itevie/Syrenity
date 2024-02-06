import * as Syrenity from 'syrenity';
import { registerContextMenu } from '../ui/contextMenus.js';
import { client } from './app.js';
import general from '../general_new.js';
import { deleteMessage } from './actions.js';
import { refresh } from './guildBar.js';
import enlargeImage from '../ui/imageEnlarger.js';

export default {
  message: (message: Syrenity.Message, element: HTMLElement) => {
    const isAuthor = client.currentUser.id === message.author.id;

    registerContextMenu({
      attachTo: element,
      not: [".message-image", ".message-pfp"],
      items: [
        {
          content: "Copy Text",
          icon: "copy",
          click: _ => {
            navigator.clipboard.writeText(message.content);
          }
        },
        {
          type: "seperator"
        },
        {
          content: "Edit Message",
          icon: "edit"
        },
        {
          content: "Pin Message",
          icon: "pin"
        },
        {
          content: "Delete Message",
          danger: true,
          icon: "delete",
          hide: !isAuthor,
          click: _ => {
            general.alerts.confirm("Are you sure you want to delete this message?", {
              yesCb: () => {
                deleteMessage(message);
              }
            })
          },
          shiftClick: () => deleteMessage(message),
        },
        {
          type: "seperator"
        },
        {
          content: "Copy ID",
          icon: "copy",
          click: _ => {
            navigator.clipboard.writeText(message.id.toString());
          }
        }
      ]
    })
  },

  guild: (guild: Syrenity.Guild, element: HTMLElement) => {
    const isOwner = client.currentUser.id === guild.owner.id;
    registerContextMenu({
      attachTo: element,
      items: [
        {
          content: guild.name,
          disabled: true,
        },
        {
          type: "button",
          content: "Create Invite",
          click: async context => {
            try {
              const inviteCode = await guild.createInvite();

              general.modals.showModal(`display_invite`, {
                values: {
                  code: inviteCode,
                  link: `${location.protocol}//${location.host}/invites/${inviteCode}`
                }
              });
            } catch (err) {
              general.alerts.error(err.message || "Unknown error", "Failed to create invite");
            }
          }
        },
        {
          type: "seperator",
        },
        {
          content: "Create Channel",
          click: async context => {
            const name = prompt("Enter channel name");
            await guild.channels.create(name);
            refresh();
          }
        },
        {
          type: "seperator"
        },
        {
          content: "Edit nickname",
          icon: "edit"
        },
        {
          type: "seperator"
        },
        {
          content: "Report Server",
          danger: true,
          icon: "report",
          hide: isOwner
        },
        {
          content: "Leave Server",
          danger: true,
          icon: "leave",
          hide: isOwner,
          click: async context => {
            general.alerts.confirm(`Are you sure you want to leave ${guild.name}`, {
              yesCb: async () => {
                try {
                  await guild.leave();
                  location.reload();
                  refresh();
                } catch (err) {
                  general.alerts.error(err.message || "Unknown error", "Failed to create invite");
                }
              }
            });
          },
          shiftClick: async () => {
            try {
              await guild.leave();
              location.reload();
              refresh();
            } catch (err) {
              general.alerts.error(err.message || "Unknown error", "Failed to create invite");
            }
          }
        },
        {
          type: "seperator",
        },
        {
          type: "button",
          content: "Copy ID",
          icon: "copy",
          click: (context) => {
            navigator.clipboard.writeText(guild.id.toString());
            context.close();
          }
        }
      ]
    })
  },

  expandImage: (src: string, element: HTMLElement, disableExpand: boolean = false) => {
    let filename = src.split('/').pop()
    registerContextMenu({
      attachTo: element,
      items: [
        {
          content: "Copy Image Link",
          icon: "copy",
          click: _ => {
            navigator.clipboard.writeText(src);
          }
        },
        {
          content: "Open Image Link",
          icon: "link",
          click: _ => {
            window.open(src);
          }
        },
        {
          type: "seperator"
        },
        {
          content: `Save Image`,
          icon: "download",
          click: async () => {
            const a = document.createElement("a");
            a.href = src;
            a.download = filename;
            a.click();
          }
        },
        {
          type: "seperator"
        },
        {
          content: "Expand Image",
          icon: "expand",
          hide: disableExpand,
          click: _ => {
            enlargeImage(src);
          }
        }
      ]
    })
  }
}