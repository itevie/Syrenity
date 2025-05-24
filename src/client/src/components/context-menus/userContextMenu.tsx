import { showContextMenu } from "../../dawn-ui/components/ContextMenuManager";
import { UserAPIData } from "../../syrenity-client/structures/User";
import { setUserViewerUser } from "../UserViewerManager";

export default function showUserContextMenu(
  e: React.MouseEvent<any, any>,
  user: UserAPIData,
) {
  showContextMenu({
    event: e,
    elements: [
      {
        type: "button",
        label: "View Profile",
        onClick() {
          setUserViewerUser(user);
        },
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        label: "Copy User ID",
        onClick() {
          window.navigator.clipboard.writeText(user.id.toString());
        },
      },
    ],
  });
}
