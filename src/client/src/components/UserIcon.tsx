import { client } from "../App";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import Icon from "../dawn-ui/components/Icon";
import { useAppSelector } from "../stores/store";
import File from "../syrenity-client/structures/File";
import User from "../syrenity-client/structures/User";
import { setUserViewerUser } from "./UserViewer";

export default function UserIcon({
  id,
  size,
  onClick,
}: {
  id: number;
  size?: string;
  onClick?: () => void;
}) {
  const users = useAppSelector((x) => x.users);
  console.log(File.check(users[id]?.avatar, 64));

  return (
    <Icon
      size={size ?? "48px"}
      src={File.check(users[id]?.avatar, 64)}
      fallback="/public/images/logos/no_shape_logo.png"
      className="clickable"
      onClick={() =>
        onClick ? onClick() : setUserViewerUser(new User(client, users[id]))
      }
      onContextMenu={(e) =>
        showContextMenu({
          event: e,
          elements: [],
        })
      }
    />
  );
}
