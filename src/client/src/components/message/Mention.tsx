import { ContextMenuEvent } from "../../dawn-ui/components/ContextMenuManager";
import { todo } from "../../dawn-ui/util";
import { useAppSelector } from "../../stores/store";
import showChannelContextMenu from "../context-menus/channelContextMenu";
import showUserContextMenu from "../context-menus/userContextMenu";
import { setUserViewerUser } from "../UserViewerManager";

export default function Mention({ data }: { data: string }) {
  const users = useAppSelector((x) => x.users);
  const channels = useAppSelector((x) => x.channels);

  let text = "Unknown Mention";
  let click: (e: ContextMenuEvent) => void = () => {};
  let context: (e: ContextMenuEvent) => void = () => {};

  switch (data[0]) {
    case "@":
      let user = users[parseInt(data.substring(1))];
      if (!user) text = `Unknown User`;
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
    case "#":
      let channel = channels[parseInt(data.substring(1))];
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
