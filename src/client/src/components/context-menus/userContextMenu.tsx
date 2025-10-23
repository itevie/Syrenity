import { client } from "../../App";
import NewContextMenu, {
  ContextMenu,
} from "../../dawn-ui/components/ContextMenu";
import { ClickEvent, todo } from "../../dawn-ui/util";
import { trans } from "../../i18n";
import { UserAPIData } from "../../syrenity-client/structures/User";
import { setUserViewerUser } from "../UserViewerManager";
import { updateContextMenu } from "../../dawn-ui/components/ContextMenuManager";

function generate(user: UserAPIData): ContextMenu {
  return {
    elements: [
      {
        type: "button",
        label: trans("user.action.view"),
        onClick() {
          setUserViewerUser(user);
        },
      },
      {
        type: "button",
        label: trans("user.action.message"),
        async onClick() {
          let data = await client.user?.ensureRelationshipWith(user.id);
          console.log(data, user);
          // TODO: Make it actually update instead of reloading
          //window.location.href = "/channels/@me/" + data?.channel.id;
        },
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        label: "user.action.copyId",
        onClick() {
          window.navigator.clipboard.writeText(user.id.toString());
        },
      },
    ],
  };
}

export function UserContextMenu({ user }: { user: UserAPIData }) {
  return <NewContextMenu options={generate(user)} />;
}

export function showUserContextMenu(e: ClickEvent, user: UserAPIData) {
  updateContextMenu(e, generate(user));
}
