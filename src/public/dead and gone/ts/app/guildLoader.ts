import * as Syrenity from "syrenity";
import ChannelManager from "./channelManager.js";
import ContentManager from './contentManager.js';
import { client } from "./app.js";
import general from "../general_new.js";
import GeneratePfp from "./components/pfp.js";
import contextMenuTemplates from "./contextMenuTemplates.js";

export default async function loadGuild(guild: Syrenity.Guild, override: boolean = false) {
  ChannelManager.class.showSkeleton();
  // Get the channels
  ContentManager.hideAll();
  
  // Get the channel manager
  const channelManager = ChannelManager.getManager(guild.id);

  if (override)
    channelManager.ready = false;

  if (channelManager.ready == false) 
    await channelManager.updateGuildContent(guild);
  channelManager.show();
  ChannelManager.class.hideSkeleton();
  laodMemberList(guild);
}

async function laodMemberList(guild: Syrenity.Guild) {
  let members = await client.util.fetchUserArray(client.util.memberArrayToUser(await guild.members.fetchList()));
  const memberPanel = document.getElementById("member-panel");
  memberPanel.innerHTML = "";

  for (const member of members) {
    memberPanel.appendChild(renderUserItem(member));
  }
}

function renderUserItem(user: Syrenity.User): HTMLDivElement {
  // Create container
  const div = document.createElement("div");
  div.classList.add("user-list-item");

  // Add pfp
  div.appendChild(GeneratePfp(user));

  // Add contents
  const contents = document.createElement("div");
  contents.innerHTML = user.username;
  div.appendChild(contents);

  return div;
}