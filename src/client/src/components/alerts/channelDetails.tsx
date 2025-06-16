import { addAlert } from "../../dawn-ui/components/AlertManager";
import Server from "../../syrenity-client/structures/Server";

function ChannelDetails({ channel }: { channel: Server }) {
  return (
    <>
      {/* TODO: Do this */}
      <label>Todo.</label>
    </>
  );
}

export default function showChannelDetails(channel: Server) {
  addAlert({
    body: <ChannelDetails channel={channel} />,
  });
}
