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
import TypingIndicator from "./TypingIndicator";

export type ExtraMessage = Message & { shouldInline?: boolean };

export interface ChannelCache {
  done: boolean;
  messages: ExtraMessage[];
  timestamp: number | null;
  last: number | null;
  typing: Typing[];
}

export interface Typing {
  user: User;
  started: number;
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
  const cache = getCache(channel.id);

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

function getCache(channel: number): ChannelCache {
  if (!channelCache.get(channel))
    channelCache.set(channel, {
      messages: [],
      timestamp: null,
      last: null,
      done: false,
      typing: [],
    });
  return channelCache.get(channel)!;
}

async function loadChannel(channel: Channel) {
  await loadMoreMessages(channel);
  setTimeout(() => {
    triggerRefresh();
  }, 1000);
}

function updateMessage(message: Message) {
  const cache = getCache(message.channelID);

  const idx = cache.messages.findIndex((x) => x.id === message.id);
  if (idx !== -1) {
    (message as ExtraMessage).shouldInline = cache.messages[idx].shouldInline;
    cache.messages[idx] = message as ExtraMessage;
  }
}

const checkInterval = setInterval(() => {
  if (!client) return;
  clearInterval(checkInterval);

  client.on("messageCreate", async (m) => {
    let cache = getCache(m.channelID);
    cache.messages = computeInlineFlags([...cache.messages, m]);
    triggerRefresh();
  });

  client.on("messageReactionAdd", (_, message) => {
    updateMessage(message as Message);
    triggerRefresh();
  });
  client.on("messageReactionRemove", (_, message) => {
    updateMessage(message as Message);
    triggerRefresh();
  });

  client.on("messageUpdate", (message) => {
    updateMessage(message as Message);
    triggerRefresh();
  });
  client.on("messageDelete", (messageID, channelID) => {
    let cache = getCache(channelID);

    const idx = cache.messages.findIndex((x) => x.id === messageID);
    if (idx !== -1) {
      cache.messages = [
        ...cache.messages.slice(0, idx),
        ...cache.messages.slice(idx + 1),
      ];
    }
  });

  client.on("channelStartTyping", (channel, user) => {
    let cache = getCache(channel.id);
    cache.typing = [
      ...cache.typing.filter(
        (x) =>
          x.user.id !== user.id && Date.now() - x.started < units.second * 5,
      ),
      { user, started: Date.now() },
    ];
  });
}, 100);

let triggerRefresh: () => void = () => {};

export default function ChannelContent({
  channel,
}: {
  channel: Channel | null;
}) {
  const [cache, setCache] = useState<ChannelCache | undefined>(undefined);

  useEffect(() => {
    if (!channel) return;
    loadChannel(channel);

    triggerRefresh = () => {
      const cache = channelCache.get(channel.id);
      setCache(cache);
    };
  }, [channel?.id]);

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

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!cache) return;
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
      const past = cache.messages
        .filter((x) => x.authorId === client.user?.id)
        .sort((a, b) => b.id - a.id);
      if (past.length > 0) setEditing(past[0].id);
    }
  }

  return !cache ? (
    <>loading...</>
  ) : (
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
        {cache.messages.map((msg) => (
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
      <TypingIndicator typing={cache.typing} />
      <ChatBar inputRef={inputRef} onKey={handleKeyDown} />
    </Column>
  );
}
