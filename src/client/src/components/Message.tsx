import { useEffect, useState } from "react";
import { addLoading, client, wrapLoading } from "../App";
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
import {
  showConfirmModel,
  showInfoAlert,
  showInputAlert,
} from "../dawn-ui/components/AlertManager";
import Link from "../dawn-ui/components/Link";
import Button from "../dawn-ui/components/Button";
import { handleClientError, isErr, wrap } from "../util";

interface MessageProps {
  message: Message;
  editing: boolean;
  // string = confirmed update
  // null = editing but pressed escape
  // true = start editing
  setEditing: (newValue: string | null | true) => void;
  scrollDown: (amount: number) => void;
}

export default function MessageC({
  message,
  editing,
  setEditing,
  scrollDown,
}: MessageProps) {
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
          onClick() {
            setEditing(true);
          },
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
          label: "React",
          onClick: async () => {
            const emoji = await showInputAlert("Enter emoji");
            if (!emoji) return;

            const result = await wrap(message.react(emoji));
            if (isErr(result)) {
              handleClientError("react", result.v);
            }
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
    wrapLoading(
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
                  onLoad={(amount) => scrollDown(amount)}
                  onClick={(url) => {
                    setFullscreenImage(url, allowedUrls);
                  }}
                  url={`${result.config.baseURL}/api/proxy?url=${url}`}
                />,
              ];
            });
          } catch {}
        }
      })()
    );
  }, [message]);

  return (
    <Row
      style={{
        gap: "10px",
      }}
    >
      <UserIcon id={message.authorId} />
      <Column
        style={{ gap: "5px", overflowX: "scroll", width: "100%" }}
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
        {editing ? (
          <Column util={["no-gap"]} style={{ overflow: "hidden" }}>
            <textarea
              autoFocus
              ref={(textarea) => {
                if (textarea) {
                  textarea.focus();
                  textarea.setSelectionRange(
                    textarea.value.length,
                    textarea.value.length
                  );
                }
              }}
              defaultValue={message.content}
              style={{ resize: "none" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  setEditing(e.currentTarget.value);
                } else if (e.key === "Escape") {
                  setEditing(null);
                }
              }}
            />
            <small>
              escape to <Link onClick={() => setEditing(null)}>cancel</Link>,
              enter to confirm
            </small>
          </Column>
        ) : (
          <Row util={["small-gap", "align-center"]}>
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    onClick={(e) => {
                      e.preventDefault();
                      showConfirmModel(
                        `Are you sure you want to visit ${(e.target as HTMLAnchorElement).href}`,
                        () => {
                          const a = document.createElement("a");
                          a.target = "_blank";
                          a.href = (e.target as HTMLAnchorElement).href;
                          a.click();
                        }
                      );
                    }}
                  />
                ),
              }}
              className={"sy-message-content"}
            >
              {message.content.replace(/\n/g, "  \n")}
            </Markdown>
            {message.isEdited && (
              <small style={{ marginLeft: "3px" }}>(edited)</small>
            )}
          </Row>
        )}

        {embeds.length > 0 && (
          <Row util={["flex-wrap"]}>{embeds.slice(0, 10)}</Row>
        )}

        {message.reactions.length > 0 && (
          <Row util={["flex-wrap", "small-gap"]}>
            {message.reactions.map((x) => (
              <Button
                className={
                  x.users.includes(client.user?.id ?? -1) ? "focus" : ""
                }
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
        )}
      </Column>
    </Row>
  );
}
