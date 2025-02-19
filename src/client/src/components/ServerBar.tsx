import { client } from "../App";
import { fallbackImage } from "../config";
import { joinOrCreateServer } from "./alerts/joinOrCreateServer";
import {
  addAlert,
  closeAlert,
  showInfoAlert,
  showInputAlert,
} from "../dawn-ui/components/AlertManager";
import Button from "../dawn-ui/components/Button";
import Column from "../dawn-ui/components/Column";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import UploadFile from "../dawn-ui/components/FileUpload";
import Icon from "../dawn-ui/components/Icon";
import Row from "../dawn-ui/components/Row";
import uploadFile from "../dawn-ui/uploadFile";
import { useAppSelector } from "../stores/store";
import File from "../syrenity-client/structures/File";
import Server from "../syrenity-client/structures/Server";
import { handleClientError, isErr, wrap } from "../util";
import ServerIcon from "./ServerIcon";
import showSettingsPage from "../app-pages/SettingsPage";

export default function ServerBar(props: {
  selected: Server | null | "@me";
  setSelected: (serverID: number | "@me") => void;
}) {
  const servers = useAppSelector((x) => x.servers);

  return (
    <Column util={["no-shrink", "no-gap"]} className={"sy-serverbar "}>
      <Column util={["no-shrink", "align-center"]} className="sy-topbar">
        <Icon
          src="/public/images/logos/no_shape_logo.png"
          size="50px"
          onClick={() => props.setSelected("@me")}
        />
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
          onClick={joinOrCreateServer}
          src="/public/icons/close.svg"
          size="32px"
        />
      </Column>
    </Column>
  );
}
