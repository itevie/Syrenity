import { client } from "../../App";
import {
  addAlert,
  showInfoAlert,
  showInputAlert,
} from "../../dawn-ui/components/AlertManager";
import uploadFile from "../../dawn-ui/uploadFile";
import Server from "../../syrenity-client/structures/Server";
import { handleClientError, isErr, wrap } from "../../util";
import Row from "../../dawn-ui/components/Row";
import Button from "../../dawn-ui/components/Button";
import showServerDetails from "../alerts/serverDetails";
import { trans } from "../../i18n";
import { ClickEvent } from "../../dawn-ui/util";
import { updateContextMenu } from "../../dawn-ui/components/ContextMenuManager";

export default function showServerContextMenu(e: ClickEvent, server: Server) {
  updateContextMenu(e, {
    elements: [
      {
        type: "button",
        label: trans("server.action.edit"),
        async onClick() {
          addAlert({
            title: "Edit server",
            body: (
              <Row>
                <Button
                  big
                  onClick={async () => {
                    const file = await uploadFile("image/*");
                    if (!file) return;
                    const uploaded = await wrap(
                      client.files.upload(file.name, file.result),
                    );

                    if (isErr(uploaded)) {
                      return handleClientError("upload file", uploaded.v);
                    }

                    const result = await wrap(
                      server.edit({
                        avatar: uploaded.v.id,
                      }),
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
        label: trans("server.action.createInvite"),
        onClick: async () => {
          const invite = await wrap(server.invites.create());
          if (isErr(invite)) {
            return handleClientError("create invite", invite.v);
          } else {
            showInfoAlert(`Your invite code is: ${invite.v.id}`);
          }
        },
      },
      {
        type: "button",
        label: trans("server.action.createChannel"),
        async onClick() {
          const name = await showInputAlert("Enter channel name");
          if (!name) return;

          let result = await wrap(server.channels.create(name));

          if (isErr(result)) {
            handleClientError("create a channel", result.v);
          } else {
            // TODO: Make it change the channel
            // props.setSelected(result.v.id);
          }
        },
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        label: trans("server.action.showDetails"),
        onClick() {
          showServerDetails(server);
        },
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        scheme: "danger",
        label: trans("server.action.leave"),
        async onClick() {
          const result = await wrap(server.leave());
          if (isErr(result)) {
            return handleClientError("leave server", result.v);
          }
        },
      },
    ],
  });
}
