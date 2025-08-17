import { useCallback, useEffect, useRef, useState } from "react";
import Channel from "../../syrenity-client/structures/Channel";
import Message from "../../syrenity-client/structures/Message";
import Column from "../../dawn-ui/components/Column";
import MessageC from "../message/Message";
import Logger from "../../dawn-ui/Logger";
import ChatBar from "./ChatBar";
import { client, wrapLoading } from "../../App";
import { units } from "../../dawn-ui/time";
import { makeListener } from "../../dawn-ui/util";
import ChannelName from "./ChannelName";
import GoogleMaterialIcon from "../../dawn-ui/components/GoogleMaterialIcon";
import Row from "../../dawn-ui/components/Row";
import User from "../../syrenity-client/structures/User";

export type ExtraMessage = Message & { shouldInline?: boolean };

interface ChannelCache {
  done: boolean;
  messages: ExtraMessage[];
  timestamp: number | null;
  last: number | null;
}

const logger = new Logger("channel-messages");
const channelCache = new Map<number, ChannelCache>();

const SCROLL_THRESHOLD = 100;
const SCROLL_RATELIMIT = units.second / 4;

let lastSendTyping = 0;

/**
 * Computes inline flags for messages (same author within 5 minutes).
 */
function computeInlineFlags(messages: Message[]): ExtraMessage[] {
  return messages.map((msg, i, arr) => {
    const prev = arr[i - 1];
    const shouldInline =
      i > 0 &&
      prev.authorId === msg.authorId &&
      msg.createdAt.getTime() - prev.createdAt.getTime() < units.minute * 5;

    (msg as ExtraMessage).shouldInline = shouldInline;
    return msg as ExtraMessage;
  });
}

/**
 * Loads older messages for a given channel and updates the cache.
 */
async function loadMoreMessages(channel: Channel): Promise<ChannelCache> {
  const cache = channelCache.get(channel.id);
  if (!cache) {
    throw new Error(`Cache for channel ${channel.id} is undefined!`);
  }

  // Prevent spamming loads
  if (cache.done) {
    logger.warn(`Not loading more messages for ${channel.id}: already done`);
    return cache;
  }
  if (cache.timestamp && Date.now() - cache.timestamp <= SCROLL_RATELIMIT) {
    logger.warn(`Skipping load: throttled for ${channel.id}`);
    return cache;
  }

  cache.timestamp = Date.now();
  logger.log(
    `Loading more messages for channel ${channel.id} starting at ${cache.last}`,
  );

  const newMessages = await wrapLoading(
    channel.messages.query(cache.last ? { startAt: cache.last } : {}),
  );

  newMessages.reverse();
  logger.log(`Loaded ${newMessages.length} messages for channel ${channel.id}`);

  const combined = [...newMessages, ...cache.messages];
  cache.messages = computeInlineFlags(combined);

  if (newMessages.length === 0) {
    cache.done = true;
    cache.last = null;
    logger.log(`Reached end of messages for channel ${channel.id}`);
  } else {
    cache.last = newMessages[0].id;
  }

  return cache;
}

function useChannelMessages(channel: Channel | null) {
  const [messages, setMessages] = useState<ExtraMessage[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [typing, setTyping] = useState<{ user: User; started: Date }[]>([]);

  // Keep a stable getter for cache
  const getCache = useCallback(
    (channelId?: number) => channelCache.get(channelId ?? channel?.id ?? -1),
    [channel?.id],
  );

  // Initial load and channel switch
  useEffect(() => {
    setTyping([]);
    if (!channel) {
      setMessages([]);
      setIsDone(false);
      return;
    }

    logger.log(`Loading channel ${channel.id}`);

    let cache = getCache();
    if (!cache) {
      cache = { done: false, messages: [], timestamp: null, last: null };
      channelCache.set(channel.id, cache);
      loadMoreMessages(channel).then((result) => {
        setMessages(result.messages);
        setIsDone(result.done);
      });
    } else {
      setMessages(cache.messages);
      setIsDone(cache.done);
    }

    // Message listeners
    const updateMessage = (m: Message) => {
      const c = getCache(m.channelID);
      if (!c) return;

      const idx = c.messages.findIndex((x) => x.id === m.id);
      if (idx !== -1) {
        (m as ExtraMessage).shouldInline = c.messages[idx].shouldInline;
        c.messages[idx] = m as ExtraMessage;
        setMessages([...c.messages]);
      }
    };

    const messageCreate = makeListener(
      client,
      "messageCreate",
      (m: Message) => {
        const c = getCache(m.channelID);
        if (!c) return;
        c.messages = computeInlineFlags([...c.messages, m]);
        setTyping((old) => {
          return [...old].filter((x) => x.user.id !== m.author.id);
        });
        setMessages([...c.messages]);
      },
    );

    const messageEdit = makeListener(client, "messageUpdate", updateMessage);

    const messageDelete = makeListener(
      client,
      "messageDelete",
      (messageId: number, channelId: number) => {
        const c = getCache(channelId);
        if (!c) return;
        const idx = c.messages.findIndex((x) => x.id === messageId);
        if (idx !== -1) {
          c.messages = [
            ...c.messages.slice(0, idx),
            ...c.messages.slice(idx + 1),
          ];
          setMessages([...c.messages]);
        }
      },
    );

    const messageReactionAdd = makeListener(
      client,
      "messageReactionAdd",
      (_, m: Message) => updateMessage(m),
    );

    const messageReactionRemove = makeListener(
      client,
      "messageReactionRemove",
      (_, m: Message) => updateMessage(m),
    );

    const channelStartTyping = makeListener(
      client,
      "channelStartTyping",
      (c, u) => {
        setTyping((old) => {
          let n = [...old].filter(
            (x) =>
              x.user.id !== u.id &&
              Date.now() - x.started.getTime() < units.second * 5,
          );

          return [...n, { user: u, started: new Date() }];
        });
      },
    );

    const timer = setInterval(() => {
      setTyping((old) => {
        let n = [...old].filter(
          (x) => Date.now() - x.started.getTime() < units.second * 5,
        );

        return [...n];
      });
    }, 1000);

    return () => {
      client.removeListener("messageCreate", messageCreate);
      client.removeListener("messageUpdate", messageEdit);
      client.removeListener("messageDelete", messageDelete);
      client.removeListener("messageReactionAdd", messageReactionAdd);
      client.removeListener("messageReactionRemove", messageReactionRemove);
      client.removeListener("channelStartTyping", channelStartTyping);
      clearInterval(timer);
    };
  }, [channel, getCache]);

  return { messages, isDone, getCache, setMessages, setIsDone, typing };
}

export default function ChannelContent({
  channel,
}: {
  channel: Channel | null;
}) {
  const { messages, isDone, getCache, setMessages, setIsDone, typing } =
    useChannelMessages(channel);

  const [editing, setEditing] = useState<number | null>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(
    (delay = 100, force = false) => {
      setTimeout(() => {
        if (
          !force &&
          (messageAreaRef.current?.scrollTop ?? 0) < SCROLL_THRESHOLD
        ) {
          return;
        }
        messageAreaRef.current?.scrollTo({
          top: messageAreaRef.current.scrollHeight,
        });
      }, delay);
    },
    [channel?.id],
  );

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const area = messageAreaRef.current;
      if (!channel || !area) return;

      if (area.scrollTop < SCROLL_THRESHOLD) {
        const prevHeight = area.scrollHeight;
        loadMoreMessages(channel).then((result) => {
          setMessages(result.messages);
          setIsDone(result.done);

          setTimeout(() => {
            area.scrollTop = area.scrollHeight - prevHeight;
          }, 20);
        });
      }
    };

    scrollToBottom();

    const area = messageAreaRef.current;
    area?.addEventListener("wheel", handleScroll);
    return () => {
      area?.removeEventListener("wheel", handleScroll);
    };
  }, [channel?.id, setMessages, setIsDone]);

  useEffect(() => {
    scrollToBottom();
  }, [channel?.id, messages]);

  // Handle sending/editing
  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value.trim();

    if (Date.now() - lastSendTyping >= units.second * 3 && e.key !== "Enter") {
      channel?.startTyping();
      lastSendTyping = Date.now();
    }

    if (e.key === "Enter" && !e.shiftKey) {
      if (!value) return;
      e.preventDefault();
      lastSendTyping = 0;

      (e.target as HTMLTextAreaElement).value = "";
      await channel?.messages.send(value);
      scrollToBottom();
    } else if (e.key === "ArrowUp" && !value) {
      const past = messages
        .filter((x) => x.authorId === client.user?.id)
        .sort((a, b) => b.id - a.id);
      if (past.length > 0) setEditing(past[0].id);
    }
  }

  return (
    <Column
      util={["flex-grow", "no-gap"]}
      style={{ overflow: "hidden", maxHeight: "100vh" }}
      className="sy-chat-content"
    >
      {/* Top bar */}
      <Row
        util={["no-shrink", "justify-center", "align-center"]}
        className="sy-topbar"
      >
        {!channel ? "Loading..." : <ChannelName channel={channel} />}
        <GoogleMaterialIcon name="search" />
      </Row>

      {/* Messages area */}
      <div
        ref={messageAreaRef}
        className="sy-chatarea dawn-column flex-grow"
        style={{
          padding: "10px",
          overflowX: "hidden",
          overflowY: "auto",
          gap: "0px",
        }}
      >
        {isDone && <label>You've reached the end - go away.</label>}
        {messages.map((msg) => (
          <MessageC
            key={msg.id}
            message={msg}
            editing={editing === msg.id}
            scrollDown={(amount) => {
              if (messageAreaRef.current) {
                messageAreaRef.current.scrollTop += amount;
              }
            }}
            setEditing={async (val) => {
              if (msg.authorId !== client.user?.id) return;

              if (val === true) {
                setEditing(msg.id);
              } else {
                setEditing(null);
                if (val !== null) {
                  await msg.edit(val);
                }
              }
            }}
          />
        ))}
      </div>

      {/* Input */}
      <ChatBar typing={typing} inputRef={inputRef} onKey={handleKeyDown} />
    </Column>
  );
}
