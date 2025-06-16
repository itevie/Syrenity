import { ReactNode } from "react";
import Message from "../../syrenity-client/structures/Message";
import Row from "../../dawn-ui/components/Row";
import { useAppSelector } from "../../stores/store";
import Mention from "./Mention";

export default function SystemMessage({ message }: { message: Message }) {
  const users = useAppSelector((d) => d.users);

  let node: ReactNode;
  let data = JSON.parse(message.content);
  switch (message.systemType) {
    case "MessagePinned":
      node = (
        <label>
          Message ({data.message_id}) was pinned by{" "}
          <Mention data={`@${data.pinned_by}`} />
        </label>
      );
      break;
    default:
      node = "FUCK!";
  }

  return <Row className="sy-message sy-system-message">{node}</Row>;
}
