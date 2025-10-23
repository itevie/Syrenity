import { joinOrCreateServer } from "./alerts/joinOrCreateServer";
import Column from "../dawn-ui/components/Column";
import Icon from "../dawn-ui/components/Icon";
import { useAppSelector } from "../stores/store";
import Server from "../syrenity-client/structures/Server";
import ServerIcon from "./ServerIcon";

export default function ServerBar(props: {
  selected: Server | null | "@me";
  setSelected: (serverID: number | "@me") => void;
}) {
  const servers = useAppSelector((x) => x.servers);

  return (
    <Column util={["no-shrink", "no-gap"]} className={"sy-serverbar "}>
      <Column util={["no-shrink", "align-center"]} className="sy-topbar">
        <Icon
          src="/public/images/logos/no_shape_logo.png"
          size="50px"
          onClick={() => props.setSelected("@me")}
        />
      </Column>
      <Column util={["align-center", "flex-grow"]} className="sy-serverlist">
        {Object.entries(servers).map(([_, s]) => (
          <ServerIcon
            key={s.id}
            server={s}
            onClick={() => props.setSelected(s.id)}
          />
        ))}
        <Icon
          onClick={joinOrCreateServer}
          src="/public/icons/close.svg"
          size="32px"
        />
      </Column>
    </Column>
  );
}
