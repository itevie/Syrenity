import { addAlert } from "../../dawn-ui/components/AlertManager";
import Server from "../../syrenity-client/structures/Server";

function ServerDetails({ server }: { server: Server }) {
  return (
    <>
      {/* TODO: Do this */}
      <label>Todo.</label>
    </>
  );
}

export default function showServerDetails(server: Server) {
  addAlert({
    body: <ServerDetails server={server} />,
  });
}
