import FriendList from "./FriendList";
import FriendRequestList from "./FriendRequestList";
import Page from "../components/Page";
import { setPage } from "../components/PageManager";
import { trans } from "../i18n";
import AddFriend from "./AddFriend";

export default function showFriendsPage() {
  setPage(
    <Page
      options={{
        sections: [
          {
            type: "button",
            label: trans("friends.list.name"),
            icon: "face",
            element: <FriendList></FriendList>,
          },
          {
            type: "button",
            label: trans("friends.blocked.name"),
            icon: "block",
            element: <></>,
          },
          {
            type: "br",
          },
          {
            type: "button",
            label: trans("friends.requests.name"),
            icon: "waving_hand",
            element: <FriendRequestList></FriendRequestList>,
          },
          {
            type: "button",
            label: trans("friends.add.name"),
            icon: "add",
            element: <AddFriend />,
          },
          {
            type: "br",
          },
          {
            type: "button",
            icon: "elderly_woman",
            label: trans("friends.historic.name"),
            element: <></>,
          },
        ],
      }}
    />,
  );
}
