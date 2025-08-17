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
import lex from "../../markdown/lexer";
import parse from "../../markdown/parser";
import { client } from "../../App";
import Button from "../../dawn-ui/components/Button";
import { showInfoAlert } from "../../dawn-ui/components/AlertManager";
import Icon from "../../dawn-ui/components/Icon";
import GoogleMatieralIcon from "../../dawn-ui/components/GoogleMaterialIcon";

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

  if (message.isSystem) return <SystemMessage message={message} />;
  else {
    let parsedMessage = parse(lex(message.content));
    let hasMentionedMe = parsedMessage.objects.some(
      (x) =>
        x.type === "mention" && (x.userId === client.user?.id || x.isEveryone),
    );
    let displayAvatar = message.getDisplay();

    let lastSeenKey = `last-seen-${message.channelID}`;
    let lastSeen = localStorage.getItem(lastSeenKey);

    if (
      message.authorId !== client.user?.id &&
      hasMentionedMe &&
      lastSeen &&
      parseInt(lastSeen) < message.id
    ) {
      new Audio("/public/audio/ping.mp3").play();
    }
    if (parseInt(lastSeen || "0") <= message.id)
      localStorage.setItem(lastSeenKey, message.id.toString());

    return (
      <Row
        util={["ignore-responsive-mobile"]}
        className={`sy-message ${message.shouldInline ? "sy-message-inline" : ""} ${hasMentionedMe ? "sy-message-mentioned" : ""}`}
      >
        {!message.shouldInline &&
          (displayAvatar.type === "normal" ? (
            <UserIcon id={message.authorId} />
          ) : (
            <Icon size="48px" src={displayAvatar.avatar.url}></Icon>
          ))}
        <Column
          className="sy-message-inner"
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
                {displayAvatar.type === "normal"
                  ? (users[message.authorId]?.username ?? `Loading...`)
                  : displayAvatar.username}
              </b>
              {message.author.isBot && (
                <label
                  className="dawn-accent-bg"
                  style={{ padding: "3px 8px", borderRadius: "10px" }}
                >
                  bot
                </label>
              )}
              <Timestamp date={message.createdAt} />
              {message.isPinned && <GoogleMatieralIcon name="pin_drop" />}
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
              <label style={{ wordWrap: "break-word", maxWidth: "100%" }}>
                {parsedMessage.element}
              </label>
              {message.isEdited && (
                <small style={{ marginLeft: "3px" }}>(edited)</small>
              )}
            </Row>
          )}

          <MessageAttachments
            message={message}
            objects={parsedMessage.objects}
          />
          <MessageReactions message={message} />
        </Column>
      </Row>
    );
  }
}
