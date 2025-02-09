import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import Icon from "../dawn-ui/components/Icon";
import { useAppSelector } from "../stores/store";
import File from "../syrenity-client/structures/File";

export default function UserIcon({ id }: { id: number }) {
  const users = useAppSelector((x) => x.users);

  return (
    <Icon
      size="48px"
      src={File.check(users[id]?.avatar)}
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
