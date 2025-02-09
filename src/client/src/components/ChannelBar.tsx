import Button from "../dawn-ui/components/Button";
import Column from "../dawn-ui/components/Column";
import { combineStyles } from "../dawn-ui/util";
import { useAppSelector } from "../stores/store";
import Channel from "../syrenity-client/structures/Channel";
import Server from "../syrenity-client/structures/Server";

export default function ChannelBar(props: {
  selected: Channel | null;
  selectedServer: Server | null;
  setSelected: (channelID: number) => void;
}) {
  const channels = useAppSelector((x) => x.channels);

  return (
    <Column util={["no-shrink", "no-gap"]} className="sy-channelbar">
      <Column util={["flex-grow", "no-gap"]}>
        <Column
          util={["no-shrink", "justify-center"]}
          className="sy-topbar sy-servername"
        >
          {props.selectedServer?.name}
        </Column>
        <Column util={["flex-grow"]} className="sy-channellist">
          {Object.entries(channels)
            .filter(([_, s]) => s.guild_id === props.selectedServer?.id)
            .map(([_, s]) => (
              <Button
                key={s.id}
                type="inherit"
                style={combineStyles(
                  {
                    textAlign: "left",
                  },
                  props.selected?.id === s.id
                    ? {
                        backgroundColor: "var(--dawn-control-hover-background)",
                      }
                    : null
                )}
                onClick={() => props.setSelected(s.id)}
              >
                {s.name}
              </Button>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
