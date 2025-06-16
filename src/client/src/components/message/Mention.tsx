import { ContextMenuEvent } from "../../dawn-ui/components/ContextMenuManager";
import { useAppSelector } from "../../stores/store";
import showUserContextMenu from "../context-menus/userContextMenu";
import { setUserViewerUser } from "../UserViewerManager";

export default function Mention({ data }: { data: string }) {
  const users = useAppSelector((x) => x.users);

  let text = "";
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
