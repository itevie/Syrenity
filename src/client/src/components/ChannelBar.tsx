import Button from "../dawn-ui/components/Button";
import Column from "../dawn-ui/components/Column";
import { useAppSelector } from "../stores/store";
import Channel from "../syrenity-client/structures/Channel";
import Server from "../syrenity-client/structures/Server";
import showChannelContextMenu from "./context-menus/channelContextMenu";
import showServerContextMenu from "./context-menus/serverContextMenu";

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
            showServerContextMenu(e, props.selectedServer!);
          }}
        >
          {props.selectedServer?.name}
        </Column>
        <Column util={["flex-grow"]} className="sy-channellist">
          {Object.entries(channels)
            .filter(([_, s]) => s.guild_id === props.selectedServer?.id)
            .sort((a, b) => a[1].position - b[1].position)
            .map(([_, c]) => (
              <Button
                className="sy-channelbar-channel"
                key={c.id}
                type="inherit"
                util={[
                  "hover",
                  props.selected?.id === c.id ? "focus" : "giraffe",
                ]}
                style={{
                  textAlign: "left",
                }}
                onClick={() => props.setSelected(c.id)}
                onContextMenu={(e) => showChannelContextMenu(e, c)}
              >
                {c.name}
              </Button>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
