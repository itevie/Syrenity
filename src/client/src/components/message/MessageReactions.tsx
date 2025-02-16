import { client } from "../../App";
import Button from "../../dawn-ui/components/Button";
import Row from "../../dawn-ui/components/Row";
import Message from "../../syrenity-client/structures/Message";

export default function MessageReactions({ message }: { message: Message }) {
  return message.reactions.length === 0 ? (
    <></>
  ) : (
    <Row util={["flex-wrap", "small-gap"]}>
      {message.reactions.map((x) => (
        <Button
          key={`${x.messageId}-${x.emoji}`}
          type={x.users.includes(client.user?.id ?? -1) ? "accent" : "normal"}
          onClick={async () => {
            if (x.users.includes(client.user?.id ?? -1)) {
              await message.removeReaction(x.emoji);
            } else {
              await message.react(x.emoji);
            }
          }}
        >
          {x.emoji} - {x.amount}
        </Button>
      ))}
    </Row>
  );
}
