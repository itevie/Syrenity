import {UserData} from "syrenity";
import { registerTooltip } from "../../ui/tooltip.js";
import { registerContextMenu } from "../../ui/contextMenus.js";
import general from '../../general_new.js';

let users: UserData[] = [];
document.addEventListener("DOMContentLoaded", async () => {
  reloadUserList();
});

async function reloadUserList() {
  const res = await fetch(`/api/users/me/applications`);
  users = (await res.json()).users as UserData[];
  users = users.sort((a, b) => a.username.localeCompare(b.username));
  renderList();
}

function renderList() {
  const userDiv = document.getElementById("users");
  userDiv.innerHTML = "";

  for (const user of users) {
    // Construct the user div
    const userContainer = document.createElement("div");
    userContainer.classList.add("user-container");

    // Create the avatar
    const avatar = document.createElement("img");
    avatar.src = user.avatar;
    avatar.classList.add("user-image");
    userContainer.appendChild(avatar);

    // Create username
    const username = document.createElement("label");
    username.innerHTML = `${user.username}#${user.discriminator}`;
    userContainer.appendChild(username);

    userContainer.id = `user-${user.id}`;

    // Tooltip to show the username
    registerTooltip({
      attachTo: userContainer,
      content: `${user.username}#${user.discriminator}`,
      flyout: "down",
      exactMouse: true,
    });

    // Context menu for details
    registerContextMenu({
      attachTo: userContainer,
      items: [
        {
          content: `${user.username}#${user.discriminator}`,
          disabled: true,
        },
        {
          content: "Change Username"
        },
        {
          content: "Change Avatar"
        },
        {
          type: "seperator"
        },
        {
          content: "Copy OAuth Link",
          icon: "copy",
          click: (context) => {
            const link = `${location.protocol}//${location.host}/oauth/authorize?user_id=${user.id}`;
            navigator.clipboard.writeText(link);
            context.close();
          }
        },
        {
          content: "Reset Token",
          icon: "refresh",
          danger: true,
          click: async context => {
            context.close();

            // Confirm the resetting of the token
            general.alerts.confirm(`Are you sure you want to reset ${user.username}'s token?`, {
              yesCb: async () => {
                const res = await fetch(`/api/applications/${user.id}/token`, {
                  method: "PATCH",
                });
    
                const json = await res.json();

                general.modals.showModal("display_token", {
                  values: {
                    token: json.token
                  }
                });
              }
            })
          }
        },
        {
          type: "seperator"
        },
        {
          content: "Remove Bot From All Servers",
          icon: "leave",
          danger: true
        },
        {
          content: "Delete Bot",
          icon: "delete",
          danger: true,
        },
        {
          type: "seperator"
        },
        {
          content: "Copy ID",
          icon: "copy",
          click: context => {
            navigator.clipboard.writeText(user.id.toString());
            context.close();
          }
        }
      ]
    })

    // Finish
    userDiv.appendChild(userContainer);
  }
}