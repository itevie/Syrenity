import { client } from "../../App";
import { ContextMenuEvent } from "../../dawn-ui/components/ContextMenuManager";
import { todo } from "../../dawn-ui/util";
import { useAppSelector } from "../../stores/store";
import FileBase from "../../syrenity-client/structures/FileBase";
import showChannelContextMenu from "../context-menus/channelContextMenu";
import showUserContextMenu from "../context-menus/userContextMenu";
import { setUserViewerUser } from "../UserViewerManager";

export enum MentionType {
  User,
  Channel,
  File,
}

export function textToMentionType(text: string): MentionType {
  switch (text) {
    case "@":
      return MentionType.User;
    case "#":
      return MentionType.Channel;
    case "f:":
      return MentionType.File;
    default:
      throw new Error("Unknown Mention Type " + text);
  }
}

export default function Mention({
  type,
  id,
}: {
  type: MentionType;
  id: string;
}) {
  const users = useAppSelector((x) => x.users);
  const channels = useAppSelector((x) => x.channels);

  let text = "Unknown Mention";
  let click: (e: ContextMenuEvent) => void = () => {};
  let context: (e: ContextMenuEvent) => void = () => {};

  switch (type) {
    case MentionType.User:
      let user = users[parseInt(id)];
      if (!user) text = `Unknown User ${id}`;
      else {
        text = `@${user.username}`;
        click = () => {
          setUserViewerUser(user);
        };
        context = (e) => {
          showUserContextMenu(e, user);
        };
      }
      break;
    case MentionType.Channel:
      let channel = channels[parseInt(id)];
      if (!channel) text = `Unknown Channel`;
      else {
        text = `#${channel.name}`;
        // TODO: Make it navigate to the channel on click
        click = () => {
          todo();
        };
        context = (e) => {
          showChannelContextMenu(e, channel);
        };
      }
      break;
    case MentionType.File:
      let file = new FileBase(client, id);
      text = `file:${id}`;
      break;
  }

  return (
    <label
      onClick={(e) => click(e)}
      onContextMenu={(e) => context(e)}
      className="sy-mention"
    >
      {text}
    </label>
  );
}
