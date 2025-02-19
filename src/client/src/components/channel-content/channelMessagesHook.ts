import { useCallback, useEffect, useState } from "react";
import Channel from "../../syrenity-client/structures/Channel";
import Message from "../../syrenity-client/structures/Message";
import Logger from "../../dawn-ui/Logger";
import {
  ClientEventFunction,
  ClientEvents,
} from "../../syrenity-client/client/Websocket";
import { client, wrapLoading } from "../../App";

const logger = new Logger("channel-messages");

export default function useChannelMessagesHook(channel: Channel | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [last, setLast] = useState<{
    message: number | null;
    timestamp: number;
  }>({ message: null, timestamp: 0 });

  useEffect(() => {
    if (!client || !channel) return;

    setMessages([]);
    setIsDone(false);
    setLast({ message: null, timestamp: 0 });
    logger.log(`Cleared messages!`);

    const listeners: [keyof ClientEvents, ClientEventFunction<any>][] = [];

    function register<T extends keyof ClientEvents>(
      event: T,
      func: ClientEventFunction<T>
    ): void {
      listeners.push([event, func]);
      client.on(event, func);
    }

    register("messageCreate", (m) => {
      if (m.channelID !== channel?.id) return;
      setMessages((old) => {
        return [...old, m];
      });
    });

    register("messageDelete", (m, c) => {
      if (c !== channel?.id) return;
      setMessages((old) => {
        let index = old.findIndex((x) => x.id === m);
        if (index) {
          old.splice(index, 1);
        }
        return [...old];
      });
    });

    register("messageUpdate", (m) => {
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

    register("messageReactionAdd", (r, m) => {
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

    loadMoreMessages(true);

    return () => {
      for (const pair of listeners) client.removeListener(pair[0], pair[1]);
      logger.log(`Channel content ${channel?.id} listeners destroyed`);
    };
  }, [channel]);

  const loadMoreMessages = useCallback(
    async (skip: boolean = false) => {
      if (
        isDone ||
        !channel ||
        (Date.now() - (last.timestamp || 0) < 500 && !skip)
      )
        return;

      logger.log(
        `Loading more messages for channel ${channel.id} starting at`,
        last,
        skip
      );

      const newMessages = await wrapLoading(
        channel.messages.query(
          last.message && !skip ? { startAt: last.message } : {}
        )
      );
      newMessages.reverse();

      if (!newMessages.length) {
        setIsDone(true);
        return;
      }

      setLast((old) => {
        return {
          message: newMessages[0]?.id ?? old.message,
          timestamp: Date.now(),
        };
      });

      setMessages((prev) => {
        return [...newMessages, ...prev];
      });

      logger.log(
        `Messages loaded in channel ${channel.id}. Oldest message is ${newMessages[0]?.id}`
      );
    },
    [messages, channel, last, isDone]
  );

  return {
    messages,
    isDone,
    loadMoreMessages,
  };
}
