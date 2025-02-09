import { useEffect, useState } from "react";
import { client } from "../App";
import Column from "../dawn-ui/components/Column";
import { showContextMenu } from "../dawn-ui/components/ContextMenuManager";
import Row from "../dawn-ui/components/Row";
import { useAppSelector } from "../stores/store";
import Message from "../syrenity-client/structures/Message";
import UserIcon from "./UserIcon";
import { AxiosResponse } from "axios";
import MessageImageAttachment from "./MessageImageAttachment";
import { setFullscreenImage } from "./ImageViewer";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { showInfoAlert } from "../dawn-ui/components/AlertManager";

export default function MessageC({ message }: { message: Message }) {
  const users = useAppSelector((x) => x.users);
  const [embeds, setEmbeds] = useState<JSX.Element[]>([]);

  function showMsgContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    showContextMenu({
      event: e,
      ignoreClasses: [".dawn-icon", ".sy-attachment-image"],
      elements: [
        {
          type: "button",
          label: "Edit Message",
          onClick: alert,
        },
        {
          type: "button",
          label: "Delete Message",
          scheme: "danger",
          onClick: async () => {
            await message.delete();
          },
        },
        {
          type: "button",
          label: "Load User",
          onClick: async () => {
            await client.users.fetch(message.authorId);
          },
        },
        {
          type: "seperator",
        },
        {
          type: "button",
          label: "Copy Text",
          onClick: () => {
            window.navigator.clipboard.writeText(message.content);
          },
        },
      ],
    });
  }

  useEffect(() => {
    (async () => {
      const urls = message.content.match(/https:\/\/[^\s]+/g);
      const allowedUrls: string[] = [];
      if (!urls) return;

      for await (const url of urls) {
        try {
          const result = (await client.rest.get(
            `/api/proxy?url=${url}`
          )) as AxiosResponse;
          if (
            !result.headers["content-type"] ||
            !result.headers["content-type"].startsWith("image/")
          )
            continue;
          allowedUrls.push(`${result.config.baseURL}/api/proxy?url=${url}`);

          setEmbeds((old) => {
            return [
              ...old,
              <MessageImageAttachment
                onClick={(url) => {
                  setFullscreenImage(url, allowedUrls);
                }}
                url={`${result.config.baseURL}/api/proxy?url=${url}`}
              />,
            ];
          });
        } catch {}
      }
    })();
  }, [message]);

  return (
    <Row
      style={{
        gap: "10px",
      }}
    >
      <UserIcon id={message.authorId} />
      <Column
        style={{ gap: "5px", overflowX: "scroll" }}
        onContextMenu={(e) => showMsgContextMenu(e)}
      >
        <Row util={["align-center"]} style={{ gap: "10px" }}>
          <b>
            {users[message.authorId]?.username ??
              `Loading... (ID ${message.authorId})`}
            ({message.id})
          </b>
          <small>{message.createdAt.toLocaleString()}</small>
        </Row>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                onClick={(e) => {
                  e.preventDefault();
                  showInfoAlert(
                    `Are you sure you want to visit ${(e.target as HTMLAnchorElement).href}`
                  );
                }}
              />
            ),
          }}
          className={"sy-message-content"}
        >
          {message.content}
        </Markdown>
        {embeds.length > 0 && <Row util={["flex-wrap"]}>{embeds}</Row>}
      </Column>
    </Row>
  );
}
