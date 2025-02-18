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
    <Flyout text={_server.name}>
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
        onContextMenu={(e) =>
          showContextMenu({
            event: e,
            elements: [
              {
                type: "button",
                label: "Edit",
                async onClick() {
                  addAlert({
                    title: "Edit server",
                    body: (
                      <Row>
                        <Button
                          big
                          onClick={async () => {
                            const file = await uploadFile("image/*");
                            const uploaded = await wrap(
                              client.files.upload(file.name, file.result)
                            );

                            if (isErr(uploaded)) {
                              return handleClientError(
                                "upload file",
                                uploaded.v
                              );
                            }

                            const result = await wrap(
                              server.edit({
                                avatar: uploaded.v.id,
                              })
                            );

                            if (isErr(result)) {
                              return handleClientError("edit avatar", result.v);
                            }
                          }}
                        >
                          Change avatar
                        </Button>
                      </Row>
                    ),
                    buttons: [
                      {
                        id: "done",
                        text: "Close",
                        click(close) {
                          close();
                        },
                      },
                    ],
                  });
                },
              },
              {
                type: "button",
                label: "Leave Server",
                async onClick() {
                  const result = await wrap(server.leave());
                  if (isErr(result)) {
                    return handleClientError("leave server", result.v);
                  }
                },
              },
              {
                type: "button",
                label: "Create Invite",
                onClick: async () => {
                  const invite = await wrap(server.invites.create());
                  if (isErr(invite)) {
                    return handleClientError("create invite", invite.v);
                  } else {
                    showInfoAlert(`Your invite code is: ${invite.v.id}`);
                  }
                },
              },
            ],
          })
        }
      />
    </Flyout>
  );
}
