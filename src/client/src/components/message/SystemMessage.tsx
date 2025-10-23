import { ReactNode } from "react";
import Message from "../../syrenity-client/structures/Message";
import Row from "../../dawn-ui/components/Row";
import { useAppSelector } from "../../stores/store";
import Mention, { MentionType } from "./Mention";
import MessageContextMenu from "../context-menus/messageContextMenu";
import MessageReactions from "./MessageReactions";
import Column from "../../dawn-ui/components/Column";

export default function SystemMessage({ message }: { message: Message }) {
  const users = useAppSelector((d) => d.users);

  let node: ReactNode;
  let data = JSON.parse(message.content);
  switch (message.systemType) {
    case "MessagePinned":
      node = (
        <label>
          Message ({data.message_id}) was pinned by{" "}
          <Mention type={MentionType.User} id={data.pinned_by} />
        </label>
      );
      break;
    default:
      node = "FUCK!";
  }

  return (
    <Column className="sy-message sy-system-message">
      {node}
      <MessageReactions message={message} />
      <MessageContextMenu options={{ message, edit: null }} />
    </Column>
  );
}
