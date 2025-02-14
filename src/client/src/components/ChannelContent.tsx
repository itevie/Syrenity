import { useCallback, useEffect, useRef, useState } from "react";
import Channel from "../syrenity-client/structures/Channel";
import Message from "../syrenity-client/structures/Message";
import Column from "../dawn-ui/components/Column";
import Row from "../dawn-ui/components/Row";
import MessageC from "./Message";
import { client, wrapLoading } from "../App";
import { useAppSelector } from "../stores/store";
import { UserReactionApiData } from "../syrenity-client/structures/Reaction";

const SCROLL_THRESHOLD = 100;
const last: Map<number, number> = new Map();
const doneList: Map<number, boolean> = new Map();
const lastScroll: Map<number, number> = new Map();

// ----- Event Listeners -----
export const messageCreated: Map<number, (message: Message) => void> =
  new Map();
export const messageDeleted: Map<number, (messageId: number) => void> =
  new Map();
export const messageUpdated: Map<number, (message: Message) => void> =
  new Map();
export const messageReaction: Map<number, (message: Message) => void> =
  new Map();

export default function ChannelContent({
  channel,
}: {
  channel: Channel | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [done, setDone] = useState<boolean>(false);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<number | null>(null);

  const scrollToBottom = useCallback(
    (delay: number = 100) => {
      setTimeout(() => {
        messageAreaRef.current?.scrollTo({
          top: messageAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, delay);
    },
    [channel]
  );

  const loadMoreMessages = useCallback(async () => {
    if (
      !channel ||
      doneList.get(channel.id) ||
      Date.now() - (lastScroll.get(channel.id) || 0) < 500
    )
      return;

    lastScroll.set(channel.id, Date.now());

    const oldest = last.get(channel.id);
    const newMessages = await wrapLoading(
      channel.messages.query(oldest ? { startAt: oldest } : {})
    );
    newMessages.reverse();

    if (!newMessages.length) {
      setDone(true);
      doneList.set(channel.id, true);
      return;
    }

    last.set(channel.id, newMessages[0]?.id ?? oldest);
    setMessages((prev) => [...newMessages, ...prev]);
  }, [channel]);

  useEffect(() => {
    setMessages([]);
    setDone(false);
    if (!channel) return;
    doneList.set(channel.id, false);
    last.delete(channel.id);
    const messageArea = messageAreaRef.current;
    if (!messageArea) return;

    const handleScroll = async () => {
      if (messageArea.scrollTop < SCROLL_THRESHOLD) {
        const prevHeight = messageArea.scrollHeight;
        await loadMoreMessages();
        setTimeout(() => {
          messageArea.scrollTop = messageArea.scrollHeight - prevHeight;
        }, 20);
      }
    };

    messageAreaRef.current?.addEventListener("wheel", handleScroll);

    messageCreated.set(channel.id, (m) => {
      setMessages((old) => {
        scrollToBottom();
        return [...old, m];
      });
    });

    messageDeleted.set(channel.id, (m) => {
      setMessages((old) => {
        let index = old.findIndex((x) => x.id === m);
        if (index) {
          old.splice(index, 1);
        }
        return [...old];
      });
    });

    messageReaction.set(channel.id, (m) => {
      setMessages((old) => {
        const index = old.findIndex((x) => x.id === m.id);
        if (index) {
          const n = [...old];
          n[index] = m;
          return [...n];
        }
        return old;
      });
    });

    messageUpdated.set(channel.id, (m) => {
      setMessages((old) => {
        let index = old.findIndex((x) => x.id === m.id);
        if (index) {
          const temp = [...old];
          temp[index] = m;
          return temp;
        }
        return old;
      });
    });

    (async () => {
      await loadMoreMessages();
      scrollToBottom();

      if (channel.type === "dm") {
        window.history.pushState(null, "", `/channels/@me/${channel.id}`);
      } else {
        window.history.pushState(
          null,
          "",
          `/channels/${channel.guildId}/${channel.id}`
        );
      }
    })();

    return () => {
      messageArea.removeEventListener("wheel", handleScroll);
    };
  }, [channel, loadMoreMessages, scrollToBottom]);

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    let value = e.currentTarget.value.trim();

    if (e.key === "Enter" && !e.shiftKey) {
      if (!value.length) return;
      e.preventDefault();

      await channel?.messages.send(value);
      (e.target as HTMLTextAreaElement).value = "";
    } else if (e.key === "ArrowUp" && value.length === 0) {
      const past = messages
        .filter((x) => x.authorId === client.user?.id)
        .sort((a, b) => b.id - a.id);
      if (past.length > 0) setEditing(past[0].id);
    }
  }

  return (
    <Column util={["flex-grow", "no-gap"]} style={{ overflowX: "hidden" }}>
      <Column util={["no-shrink", "justify-center"]} className="sy-topbar">
        {channel?.name}
      </Column>
      <div
        ref={messageAreaRef}
        className="sy-chatarea dawn-column flex-grow"
        style={{ padding: "10px", overflowX: "hidden", overflowY: "auto" }}
      >
        {done && <label>You've reached the end - go away.</label>}
        {(messages || []).map((x) => (
          <MessageC
            scrollDown={(amount) => {
              console.log("scrolling", amount);
              if (messageAreaRef.current) {
                messageAreaRef.current.scrollTop += amount;
              }
            }}
            editing={editing === x.id}
            setEditing={async (e) => {
              if (e === true) {
                setEditing(x.id);
              } else {
                setEditing(null);
                if (e !== null) {
                  await x.edit(e);
                }
              }
            }}
            key={x.id}
            message={x}
          />
        ))}
      </div>
      <Row util={["no-shrink", "no-gap"]} className="sy-messageinput">
        <textarea style={{ resize: "none" }} onKeyUp={handleKeyDown} />
      </Row>
    </Column>
  );
}
