import { useCallback, useEffect, useRef, useState } from "react";
import Channel from "../../syrenity-client/structures/Channel";
import Message from "../../syrenity-client/structures/Message";
import Column from "../../dawn-ui/components/Column";
import MessageC from "../message/Message";
import Logger from "../../dawn-ui/Logger";
import ChatBar from "./ChatBar";
import { client, wrapLoading } from "../../App";
import { units } from "../../dawn-ui/time";

interface ChannelCache {
  done: boolean;
  messages: Message[];
  timestamp: number | null;
  last: number | null;
}

const logger = new Logger("channel-messages");
const channelCache = new Map<number, ChannelCache>();

const SCROLL_THRESHOLD = 100;

async function loadMoreMessages(channel: Channel): Promise<ChannelCache> {
  const cache = channelCache.get(channel.id);
  if (!cache) {
    throw `Cache for ${channel.id} was undefined!`;
  }

  // Check if it should load more
  if (cache.done) {
    logger.warn(
      `Not loading more messages for ${channel.id} as it is marked as done`,
    );
    return cache;
  }

  if (cache.timestamp && Date.now() - cache.timestamp <= units.second) {
    logger.warn(
      `Not loading more messages for ${channel.id} as the timestamp is too soon`,
    );
    return cache;
  }

  logger.log(
    `Loading more messages for channel ${channel.id} starting at message ${cache.last}`,
  );

  // Set last
  cache.timestamp = Date.now();

  // Load them
  const newMessages = await wrapLoading(
    channel.messages.query(cache.last ? { startAt: cache.last } : {}),
  );
  newMessages.reverse();
  logger.log(`Loaded ${newMessages.length} messages for channel ${channel.id}`);

  // Update
  cache.messages = [...newMessages, ...cache.messages];

  if (!newMessages.length) {
    cache.done = true;
    cache.last = null;
    logger.log(`Reached end of messages for channel ${channel.id}`);
  } else {
    cache.last = newMessages[0].id;
  }

  return cache;
}

export default function ChannelContent({
  channel,
}: {
  channel: Channel | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [editing, setEditing] = useState<number | null>(null);

  const messageAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(
    (delay: number = 100, force: boolean = false) => {
      setTimeout(() => {
        if (
          !force &&
          (messageAreaRef.current?.scrollTop ?? 0 < SCROLL_THRESHOLD)
        )
          return;
        messageAreaRef.current?.scrollTo({
          top: messageAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, delay);
    },
    [channel],
  );

  async function _loadMoreMessages(channel: Channel) {
    const result = await loadMoreMessages(channel);
    setData(result);
  }

  function setData(cache: ChannelCache) {
    setIsDone(cache.done);
    setMessages(cache.messages);
  }

  // For initial load of the channel
  useEffect(() => {
    if (!channel) return;

    logger.log(`Loading channel ${channel.id}`);

    const cache = channelCache.get(channel.id);
    if (!cache) {
      channelCache.set(channel.id, {
        done: false,
        messages: [],
        timestamp: null,
        last: null,
      });
      _loadMoreMessages(channel).then(() => {
        scrollToBottom(100, true);
      });
    } else {
      setData(cache);
    }
    scrollToBottom(100, true);
  }, [channel]);

  // For detecting scrolls
  useEffect(() => {
    if (channel)
      if (channel.type === "dm") {
        window.history.pushState(null, "", `/channels/@me/${channel.id}`);
      } else {
        window.history.pushState(
          null,
          "",
          `/channels/${channel.guildId}/${channel.id}`,
        );
      }

    const handleScroll = async () => {
      const messageArea = messageAreaRef.current;
      if (!messageArea || !channel) return;

      if (messageArea.scrollTop < SCROLL_THRESHOLD) {
        const prevHeight = messageArea.scrollHeight;
        _loadMoreMessages(channel).then(() => {
          setTimeout(() => {
            messageArea.scrollTop = messageArea.scrollHeight - prevHeight;
          }, 20);
        });
      }
    };

    if (messageAreaRef.current)
      messageAreaRef.current.addEventListener("wheel", handleScroll);

    return () => {
      messageAreaRef.current?.removeEventListener("wheel", handleScroll);
    };
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
