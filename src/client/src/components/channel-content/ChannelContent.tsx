import { useCallback, useEffect, useRef, useState } from "react";
import Channel from "../../syrenity-client/structures/Channel";
import Message from "../../syrenity-client/structures/Message";
import Column from "../../dawn-ui/components/Column";
import MessageC from "../message/Message";
import Logger, { defaultLogger } from "../../dawn-ui/Logger";
import ChatBar from "./ChatBar";
import {
  ClientEventFunction,
  ClientEvents,
} from "../../syrenity-client/client/Websocket";
import { client } from "../../App";
import useChannelMessagesHook from "./channelMessagesHook";

const SCROLL_THRESHOLD = 100;

export default function ChannelContent({
  channel,
}: {
  channel: Channel | null;
}) {
  const { messages, loadMoreMessages, isDone } =
    useChannelMessagesHook(channel);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(
    (delay: number = 100) => {
      setTimeout(() => {
        if (messageAreaRef.current?.scrollTop ?? 0 < SCROLL_THRESHOLD) return;
        messageAreaRef.current?.scrollTo({
          top: messageAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, delay);
    },
    [channel],
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = async () => {
      const messageArea = messageAreaRef.current;
      if (!messageArea) return;

      if (messageArea.scrollTop < SCROLL_THRESHOLD) {
        const prevHeight = messageArea.scrollHeight;
        await loadMoreMessages();
        setTimeout(() => {
          messageArea.scrollTop = messageArea.scrollHeight - prevHeight;
        }, 20);
      }
    };

    if (messageAreaRef.current)
      messageAreaRef.current.addEventListener("wheel", handleScroll);

    return () => {
      messageAreaRef.current?.removeEventListener("wheel", handleScroll);
    };
  }, [channel, loadMoreMessages]);

  useEffect(() => {
    defaultLogger.log(`Loading channel ${channel?.id}`);
    if (!channel) return;

    if (channel.type === "dm") {
      window.history.pushState(null, "", `/channels/@me/${channel.id}`);
    } else {
      window.history.pushState(
        null,
        "",
        `/channels/${channel.guildId}/${channel.id}`,
      );
    }
  }, [channel]);

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
    <Column
      util={["flex-grow", "no-gap"]}
      style={{ overflowX: "hidden" }}
      className="sy-chat-content"
    >
      <Column util={["no-shrink", "justify-center"]} className="sy-topbar">
        {channel?.name}
      </Column>
      <div
        ref={messageAreaRef}
        className="sy-chatarea dawn-column flex-grow"
        style={{ padding: "10px", overflowX: "hidden", overflowY: "auto" }}
      >
        {isDone && <label>You've reached the end - go away.</label>}
        {(messages || []).map((x) => (
          <MessageC
            scrollDown={(amount) => {
              if (messageAreaRef.current) {
                messageAreaRef.current.scrollTop += amount;
              }
            }}
            editing={editing === x.id}
            setEditing={async (e) => {
              if (x.authorId !== client.user?.id) return;

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
      <ChatBar inputRef={inputRef} onKey={handleKeyDown} />
    </Column>
  );
}
