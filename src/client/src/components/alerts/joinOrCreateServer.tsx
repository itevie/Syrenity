import { client } from "../../App";
import {
  addAlert,
  closeAlert,
  showInfoAlert,
  showInputAlert,
} from "../../dawn-ui/components/AlertManager";
import { isErr, handleClientError, wrap } from "../../util";

export function joinOrCreateServer() {
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

          const invite = await wrap(client.invites.fetch(input));
          if (isErr(invite)) {
            return handleClientError("load invite", invite.v);
          }

          const joinResult = await wrap(invite.v.use());
          if (isErr(joinResult)) {
            return handleClientError("join server", joinResult.v);
          }

          showInfoAlert("joined!");
        },
      },
      {
        id: "create",
        text: "Create",
        click: async () => {
          const name = await showInputAlert("Enter the server name");
          if (!name) return;

          const server = await wrap(client.createServer(name));
          if (isErr(server)) {
            return handleClientError("creating server", server.v);
          }

          closeAlert();
          window.location.href = `/channels/${server.v.id}`;
        },
      },
    ],
  });
}
