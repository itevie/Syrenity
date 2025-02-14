import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import Icon from "../dawn-ui/components/Icon";
import { useAppSelector } from "../stores/store";
import File from "../syrenity-client/structures/File";

export default function UserIcon({ id, size }: { id: number; size?: string }) {
  const users = useAppSelector((x) => x.users);

  return (
    <Icon
      size={size ?? "48px"}
      src={File.check(users[id]?.avatar, 64)}
      fallback="/public/images/logos/no_shape_logo.png"
      onContextMenu={(e) =>
        showContextMenu({
          event: e,
          elements: [],
        })
      }
    />
  );
}
