import Icon from "../dawn-ui/components/Icon";
import Server, { ServerAPIData } from "../syrenity-client/structures/Server";
import Flyout from "../dawn-ui/components/Flyout";
import React from "react";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import { addAlert, showInfoAlert } from "../dawn-ui/components/AlertManager";
import { client } from "../App";
import File from "../syrenity-client/structures/File";
import { generateAvatar, handleClientError, isErr, wrap } from "../util";
import { fallbackImage } from "../config";
import Row from "../dawn-ui/components/Row";
import Button from "../dawn-ui/components/Button";
import uploadFile from "../dawn-ui/uploadFile";
import { useAppSelector } from "../stores/store";
import showServerContextMenu from "./context-menus/serverContextMenu";

export default function ServerIcon({
  server: _server,
  onClick,
}: {
  server: ServerAPIData;
  onClick: (id: ServerAPIData) => void;
}) {
  const servers = useAppSelector((x) => x.servers);
  const server = new Server(client, servers[_server.id]);

  return (
    <Flyout text={_server.name} direction="right">
      <Icon
        key={`pfp-${_server.id}`}
        onClick={() => onClick(_server)}
        size="48px"
        src={
          File.check(servers[_server.id].avatar, 64) ??
          generateAvatar(servers[_server.id].name) ??
          fallbackImage
        }
        fallback={fallbackImage}
        onContextMenu={(e) => showServerContextMenu(e, server)}
      />
    </Flyout>
  );
}
