import { client } from "../../App";
import { units } from "../../dawn-ui/time";
import User from "../../syrenity-client/structures/User";

export default function TypingIndicator({
  typing,
}: {
  typing: { user: User; started: Date }[];
}) {
  let t = typing.filter(
    (x) =>
      Date.now() - x.started.getTime() < units.second * 3 &&
      x.user.id !== client.user?.id,
  );
  return (
    <div style={{ height: "10px", minHeight: "10px", marginLeft: "15px" }}>
      {t.length > 0 ? (
        <label>
          {t.length === 1 ? (
            <>{t[0].user.username} is typing...</>
          ) : (
            <>
              {toEnglishSentence(t.map((x) => x.user.username))} are typing...
            </>
          )}
        </label>
      ) : (
        <label></label>
      )}
    </div>
  );
}

function toEnglishSentence(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
