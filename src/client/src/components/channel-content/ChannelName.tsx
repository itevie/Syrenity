import Row from "../../dawn-ui/components/Row";
import Words, { TextType } from "../../dawn-ui/components/Words";
import Channel from "../../syrenity-client/structures/Channel";

export default function ChannelName({ channel }: { channel: Channel }) {
  return (
    <Row util={["align-center", "small-gap"]}>
      <Words type={TextType.Small} style={{ fontSize: "1em" }}>
        {channel.type === "dm" ? "@" : "#"}
      </Words>
      <Words>{channel.name}</Words>
    </Row>
  );
}
