import { client } from "../App";
import {
  showConfirmModel,
  showErrorAlert,
  showInputAlert,
} from "../dawn-ui/components/AlertManager";
import Button from "../dawn-ui/components/Button";
import Column from "../dawn-ui/components/Column";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import { useAppSelector } from "../stores/store";
import Channel from "../syrenity-client/structures/Channel";
import Server from "../syrenity-client/structures/Server";
import { handleClientError, isErr, isOk, wrap } from "../util";

export default function ChannelBar(props: {
  selected: Channel | null;
  selectedServer: Server | null;
  setSelected: (channelID: number) => void;
}) {
  const channels = useAppSelector((x) => x.channels);

  return (
    <Column util={["no-shrink", "no-gap"]} className="sy-channelbar">
      <Column util={["flex-grow", "no-gap"]} className="sy-channelbar-inner">
        <Column
          util={["no-shrink", "justify-center"]}
          className="sy-topbar sy-servername"
          onContextMenu={(e) => {
            showContextMenu({
              event: e,
              elements: [
                {
                  type: "button",
                  label: "Create Channel",
                  async onClick() {
                    if (!props.selectedServer) return;

                    const name = await showInputAlert("Enter channel name");
                    if (!name) return;

                    let result = await wrap(
                      props.selectedServer.channels.create(name),
                    );

                    if (isErr(result)) {
                      handleClientError("create a channel", result.v);
                    } else {
                      props.setSelected(result.v.id);
                    }
                  },
                },
              ],
            });
          }}
        >
          {props.selectedServer?.name}
        </Column>
        <Column util={["flex-grow"]} className="sy-channellist">
          {Object.entries(channels)
            .filter(([_, s]) => s.guild_id === props.selectedServer?.id)
            .sort((a, b) => a[1].position - b[1].position)
            .map(([_, s]) => (
              <Button
                className="sy-channelbar-channel"
                key={s.id}
                type="inherit"
                util={[
                  "hover",
                  props.selected?.id === s.id ? "focus" : "giraffe",
                ]}
                style={{
                  textAlign: "left",
                }}
                onClick={() => props.setSelected(s.id)}
                onContextMenu={(e) => {
                  showContextMenu({
                    event: e,
                    elements: [
                      {
                        type: "button",
                        label: "Set Position",
                        async onClick() {
                          const id = await showInputAlert("Enter position");
                          const channel = await client.channels.fetch(s.id);
                          await channel.edit({
                            position: parseInt(id ?? "-1"),
                          });
                        },
                      },
                      {
                        type: "button",
                        scheme: "danger",
                        label: "Delete",
                        onClick() {
                          showConfirmModel("Are you sure?", () => {});
                        },
                      },
                    ],
                  });
                }}
              >
                {s.name} ({s.id}: {s.position})
              </Button>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
