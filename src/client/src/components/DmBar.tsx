import { useEffect, useState } from "react";
import Button from "../dawn-ui/components/Button";
import Column from "../dawn-ui/components/Column";
import Channel from "../syrenity-client/structures/Channel";
import Server from "../syrenity-client/structures/Server";
import Relationship from "../syrenity-client/structures/Relationship";
import { client } from "../App";
import Row from "../dawn-ui/components/Row";
import UserIcon from "./UserIcon";
import showUserContextMenu from "./context-menus/userContextMenu";
import { useTranslation } from "react-i18next";
import showFriendsPage from "../app-pages/FriendsPage";
import Words from "../dawn-ui/components/Words";

export default function DmBar(props: {
  selected: Channel | null;
  selectedServer: Server | null;
  setSelected: (channelID: number) => void;
}) {
  const { i18n } = useTranslation();
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  useEffect(() => {
    (async () => {
      setRelationships((await client.user?.fetchRelationships()) || []);
    })();
  }, []);

  return (
    <Column util={["no-shrink", "no-gap"]} className="sy-channelbar">
      <Column util={["flex-grow", "no-gap"]}>
        <Column
          util={["no-shrink", "justify-center"]}
          className="sy-topbar sy-servername"
        >
          DMs
        </Column>
        <Column util={["flex-grow", "small-gap"]} className="sy-channellist">
          <Button type="inherit" onClick={showFriendsPage}>
            {i18n.t("dms.manage")}
          </Button>
          {relationships
            .sort((a, b) => a.lastMessage.getTime() - b.lastMessage.getTime())
            .map((r) => (
              <Button
                onContextMenu={(e) => showUserContextMenu(e, r.recipient.data)}
                key={r.recipient.id}
                type="inherit"
                util={[
                  "hover",
                  props.selected?.id === r.channel.id ? "focus" : "giraffe",
                ]}
                style={{
                  textAlign: "left",
                }}
                onClick={() => props.setSelected(r.channel.id)}
              >
                <Row util={["small-gap", "align-center"]}>
                  <UserIcon id={r.recipient.id} size="32px" />
                  {r.recipient.username}
                </Row>
              </Button>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
