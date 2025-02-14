import Icon from "../dawn-ui/components/Icon";
import Server, { ServerAPIData } from "../syrenity-client/structures/Server";
import Flyout from "../dawn-ui/components/Flyout";
import React from "react";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import { showInfoAlert } from "../dawn-ui/components/AlertManager";
import { client } from "../App";
import File from "../syrenity-client/structures/File";
import { generateAvatar } from "../util";
import { fallbackImage } from "../config";

export default function ServerIcon({
  server,
  onClick,
}: {
  server: ServerAPIData;
  onClick: (id: ServerAPIData) => void;
}) {
  return (
    <Flyout text={server.name}>
      <Icon
        key={`pfp-${server.id}`}
        onClick={() => onClick(server)}
        size="48px"
        src={
          File.check(server.avatar, 64) ??
          generateAvatar(server.name) ??
          fallbackImage
        }
        fallback={fallbackImage}
        onContextMenu={(e) =>
          showContextMenu({
            event: e,
            elements: [
              {
                type: "button",
                label: "Create Invite",
                onClick: async () => {
                  const guild = await client.servers.fetch(server.id);
                  const invite = await guild.invites.create();
                  showInfoAlert(invite.id);
                },
              },
            ],
          })
        }
      />
    </Flyout>
  );
}
