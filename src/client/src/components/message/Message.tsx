import Column from "../../dawn-ui/components/Column";
import Row from "../../dawn-ui/components/Row";
import { useAppSelector } from "../../stores/store";
import Message from "../../syrenity-client/structures/Message";
import UserIcon from "../UserIcon";
import Link from "../../dawn-ui/components/Link";
import MessageContent from "./MessageContent";
import MessageReactions from "./MessageReactions";
import { showMessageContextMenu } from "../context-menus/messageContextMenu";
import MessageAttachments from "./MessageAttachments";
import "./message.css";
import Timestamp from "./Timestamp";
import SystemMessage from "./SystemMessage";
import { ExtraMessage } from "../channel-content/ChannelContent";
import Words, { TextType } from "../../dawn-ui/components/Words";

interface MessageProps {
  message: ExtraMessage;
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

  return message.isSystem ? (
    <SystemMessage message={message} />
  ) : (
    <Row
      className={`sy-message ${message.shouldInline ? "sy-message-inline" : ""}`}
      style={{
        gap: "10px",
      }}
    >
      {!message.shouldInline && <UserIcon id={message.authorId} />}
      <Column
        style={{ gap: "4px", overflowX: "auto", width: "100%" }}
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
        {!message.shouldInline && (
          <Row util={["align-center"]} style={{ gap: "10px" }}>
            <b>
              {users[message.authorId]?.username ??
                `Loading... (ID ${message.authorId})`}
              ({message.id})
            </b>
            <Timestamp date={message.createdAt} />
          </Row>
        )}
        {editing ? (
          <Column util={["no-gap"]} style={{ overflow: "hidden" }}>
            <textarea
              autoFocus
              ref={(textarea) => {
                if (textarea) {
                  textarea.focus();
                  textarea.setSelectionRange(
                    textarea.value.length,
                    textarea.value.length,
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
