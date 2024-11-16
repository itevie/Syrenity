import { client } from "../App";
import Column from "../dawn-ui/components/Column";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import Icon from "../dawn-ui/components/Icon";
import Row from "../dawn-ui/components/Row";
import { useAppSelector } from "../stores/store";
import File from "../syrenity-client/structures/File";
import Message from "../syrenity-client/structures/Message";

export default function MessageC({ message }: { message: Message }) {
  const users = useAppSelector((x) => x.users);

  function showMsgContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    showContextMenu({
      event: e,
      elements: [
        {
          type: "button",
          label: "Edit Message",
          onClick: alert,
        },
        {
          type: "button",
          label: "Delete Message",
          scheme: "danger",
          onClick: alert,
        },
        {
          type: "button",
          label: "Load User",
          onClick: async () => {
            await client.users.fetch(message.authorId);
          },
        },
        {
          type: "seperator",
        },
        {
          type: "button",
          label: "Copy Text",
          onClick: () => {
            window.navigator.clipboard.writeText(message.content);
          },
        },
      ],
    });
  }

  return (
    <Row
      util={["no-shrink"]}
      style={{ gap: "10px" }}
      onContextMenu={(e) => showMsgContextMenu(e)}
    >
      <Icon
        size="48px"
        src={File.check(users[message.authorId]?.avatar)}
        fallback="/public/images/logos/no_shape_logo.png"
      />
      <Column util={["flex-grow"]} style={{ gap: "5px" }}>
        <Row util={["align-center"]} style={{ gap: "10px" }}>
          <b>
            {users[message.authorId]?.username ??
              `Loading... (ID ${message.authorId})`}
          </b>
          <small>{message.createdAt.toLocaleString()}</small>
        </Row>
        <label>{message.content}</label>
      </Column>
    </Row>
  );
}
