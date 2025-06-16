import { addAlert } from "../../dawn-ui/components/AlertManager";
import Channel, {
  ChannelAPIData,
} from "../../syrenity-client/structures/Channel";
import Server from "../../syrenity-client/structures/Server";

function ChannelDetails({ channel }: { channel: ChannelAPIData }) {
  return (
    <>
      {/* TODO: Do this */}
      <label>Todo.</label>
    </>
  );
}

export default function showChannelDetails(channel: ChannelAPIData) {
  addAlert({
    body: <ChannelDetails channel={channel} />,
  });
}
