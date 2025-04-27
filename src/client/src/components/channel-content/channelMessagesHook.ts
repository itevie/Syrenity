import { useCallback, useEffect, useState } from "react";
import Channel from "../../syrenity-client/structures/Channel";
import Message from "../../syrenity-client/structures/Message";
import Logger from "../../dawn-ui/Logger";
import {
  ClientEventFunction,
  ClientEvents,
} from "../../syrenity-client/client/Websocket";
import { client, wrapLoading } from "../../App";
import { units } from "../../dawn-ui/time";

const logger = new Logger("channel-messagets");
const lastLoads: Map<number, { last: number | null; timestamp: Date }> =
  new Map();

export default function useChannelMessagesHook(channel: Channel | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    if (!client || !channel) return;

    setMessages([]);
    logger.log(`Cleared messages!`);

    const listeners: [keyof ClientEvents, ClientEventFunction<any>][] = [];

    function register<T extends keyof ClientEvents>(
      event: T,
      func: ClientEventFunction<T>,
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
      if (!channel) return;
      let past = lastLoads.get(channel.id);
      if (past && Date.now() - past.timestamp.getTime() <= units.second) return;

      if (!past) past = { last: null, timestamp: new Date() };
      past.timestamp = new Date();
      lastLoads.set(channel.id, past);

      logger.log(
        `Loading more messages for channel ${channel.id} starting at`,
        skip,
      );

      const newMessages = await wrapLoading(
        channel.messages.query(
          past.last && !skip ? { startAt: past.last } : {},
        ),
      );
      newMessages.reverse();

      lastLoads.set(channel.id, { ...past, last: newMessages[0].id });

      if (!newMessages.length) {
        setIsDone(true);
        return;
      }

      setMessages((prev) => {
        return [...newMessages, ...prev];
      });

      logger.log(
        `Messages loaded in channel ${channel.id}. Oldest message is ${newMessages[0]?.id}`,
      );
    },
    [messages, channel, isDone],
  );

  return {
    messages,
    isDone,
    loadMoreMessages,
  };
}
