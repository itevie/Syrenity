import { client } from "../App";
import Icon from "../dawn-ui/components/Icon";
import { useAppSelector } from "../stores/store";
import File from "../syrenity-client/structures/File";
import { allowedSizes } from "../syrenity-client/structures/FileBase";
import User from "../syrenity-client/structures/User";
import { showUserContextMenu } from "./context-menus/userContextMenu";
import { setUserViewerUser } from "./UserViewerManager";

export default function UserIcon({
  id,
  size,
  quality,
  onClick,
}: {
  id: number;
  size?: string;
  quality?: (typeof allowedSizes)[number];
  onClick?: () => void;
}) {
  const users = useAppSelector((x) => x.users);

  return (
    <Icon
      size={size ?? "48px"}
      src={File.check(users[id]?.avatar, quality ?? 64)}
      fallback="/public/images/logos/no_shape_logo.png"
      className="clickable"
      onClick={() =>
        onClick ? onClick() : setUserViewerUser(new User(client, users[id]))
      }
      onContextMenu={(e) => showUserContextMenu(e, users[id])}
    />
  );
}
