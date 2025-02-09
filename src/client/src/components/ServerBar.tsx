import { client } from "../App";
import { addAlert, showInputAlert } from "../dawn-ui/components/AlertManager";
import Column from "../dawn-ui/components/Column";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import Icon from "../dawn-ui/components/Icon";
import { useAppSelector } from "../stores/store";
import Server from "../syrenity-client/structures/Server";
import ServerIcon from "./ServerIcon";

export default function ServerBar(props: {
  selected: Server | null;
  setSelected: (serverID: number) => void;
}) {
  const servers = useAppSelector((x) => x.servers);

  async function joinServerButton() {
    addAlert({
      title: "Join or create a server",
      body: <label>What exciting adventure shall we set ahead on today?</label>,
      buttons: [
        {
          id: "close",
          text: "Close",
          click: (c) => {
            c();
          },
        },
        {
          id: "join",
          text: "Join",
          click: async () => {
            const input = await showInputAlert("Enter Invite Code");
            if (!input) return;
          },
        },
        {
          id: "create",
          text: "Create",
          click: async () => {
            const name = await showInputAlert("Enter the server name");
            if (!name) return;
            const server = await client.createServer(name);
            console.log(server);
          },
        },
      ],
    });
  }

  function showUserAreaCtx(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
    showContextMenu({
      event: e,
      elements: [
        {
          type: "button",
          scheme: "danger",
          label: "Logout",
          onClick: () => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          },
        },
      ],
    });
  }

  return (
    <Column util={["no-shrink", "no-gap"]} className="sy-serverbar">
      <Column util={["no-shrink", "align-center"]} className="sy-topbar">
        <Icon src="/public/images/logos/no_shape_logo.png" size="50px" />
      </Column>
      <Column util={["align-center", "flex-grow"]} className="sy-serverlist">
        {Object.entries(servers).map(([_, s]) => (
          <ServerIcon
            key={s.id}
            server={s}
            onClick={() => props.setSelected(s.id)}
          />
        ))}
        <Icon
          onClick={joinServerButton}
          src="/public/icons/close.svg"
          size="32px"
        />
      </Column>
      <Column util={["no-shrink", "align-center"]} className="sy-accountarea">
        <Icon
          src={client?.user?.avatar.url ?? ""}
          size="48px"
          onContextMenu={showUserAreaCtx}
        />
      </Column>
    </Column>
  );
}
