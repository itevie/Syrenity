import { useEffect, useState } from "react";
import { addLoading, baseUrl, client, wrapLoading } from "../../App";
import Column from "../../dawn-ui/components/Column";
import Row from "../../dawn-ui/components/Row";
import { useAppSelector } from "../../stores/store";
import Message from "../../syrenity-client/structures/Message";
import UserIcon from "../UserIcon";
import { AxiosResponse } from "axios";
import MessageImageAttachment from "../MessageImageAttachment";
import { setFullscreenImage } from "../ImageViewer";

import Link from "../../dawn-ui/components/Link";
import File from "../../syrenity-client/structures/File";
import { defaultLogger } from "../../dawn-ui/Logger";
import MessageContent from "./MessageContent";
import MessageReactions from "./MessageReactions";
import { showMessageContextMenu } from "../context-menus/messageContextMenu";
import MessageAttachments from "./MessageAttachments";

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

  return (
    <Row
      style={{
        gap: "10px",
      }}
    >
      <UserIcon id={message.authorId} />
      <Column
        style={{ gap: "5px", overflowX: "scroll", width: "100%" }}
        onContextMenu={(e) =>
          showMessageContextMenu({
            message,
            event: e,
            edit() {
              setEditing(true);
            },
          })
        }
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
            <MessageContent message={message} />
            {message.isEdited && (
              <small style={{ marginLeft: "3px" }}>(edited)</small>
            )}
          </Row>
        )}

        <MessageAttachments message={message} />
        <MessageReactions message={message} />
      </Column>
    </Row>
  );
}
