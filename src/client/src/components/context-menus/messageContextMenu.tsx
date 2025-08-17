import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  addAlert,
  closeAlert,
  showInfoAlert,
} from "../../dawn-ui/components/AlertManager";
import { showContextMenu } from "../../dawn-ui/components/ContextMenuManager";
import Row from "../../dawn-ui/components/Row";
import { isErr, handleClientError, wrap } from "../../util";
import Message from "../../syrenity-client/structures/Message";
import { trans } from "../../i18n";
import { addTextToChatBar } from "../channel-content/ChatBar";

export interface MessageContextMenuOptions {
  event: React.MouseEvent<HTMLDivElement, MouseEvent>;
  message: Message;
  edit: () => void;
}

export function showMessageContextMenu(options: MessageContextMenuOptions) {
  showContextMenu({
    event: options.event,
    ignoreClasses: [".dawn-icon", ".sy-attachment-image", ".sy-mention"],
    elements: [
      {
        type: "button",
        label: trans("message.action.edit"),
        onClick() {
          options.edit();
        },
      },
      {
        type: "button",
        label: trans(
          options.message.isPinned
            ? "message.action.unpin"
            : "message.action.pin",
        ),
        async onClick() {
          const result = await wrap(
            options.message.isPinned
              ? options.message.unpin()
              : options.message.pin(),
          );
          if (isErr(result)) {
            return handleClientError(
              options.message.isPinned ? "unpin" : "pin",
              result.v,
            );
          }
        },
      },
      {
        type: "button",
        label: trans("message.action.react"),
        onClick: async () => {
          addAlert({
            id: "emoji-picker",
            title: "Emoji",
            body: (
              <Row util={["align-center", "justify-center"]}>
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={async (emoji) => {
                    closeAlert("emoji-picker");

                    if (!emoji) return;

                    const result = await wrap(
                      options.message.react(emoji.emoji),
                    );
                    if (isErr(result)) {
                      handleClientError("react", result.v);
                    }
                  }}
                />
              </Row>
            ),
            buttons: [
              {
                id: "close",
                text: "Close",
                click(close) {
                  close();
                },
              },
            ],
          });
        },
      },
      {
        type: "button",
        label: trans("message.action.reply"),
        onClick: async () => {
          addTextToChatBar(
            options.message.content
              .split("\n")
              .map((x) => `>${x}`)
              .join("\n") + "\n",
            "prepend",
          );
        },
      },
      {
        type: "button",
        label: trans("message.action.mention"),
        onClick: () => {
          addTextToChatBar(`<@${options.message.author.id}>`, "prepend");
        },
      },
      {
        type: "button",
        label: trans("message.action.delete"),
        scheme: "danger",
        onClick: async () => {
          const result = await wrap(options.message.delete());
          if (isErr(result)) {
            return handleClientError("delete message", result.v);
          }
        },
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        label: trans("message.action.copyText"),
        onClick: () => {
          window.navigator.clipboard.writeText(options.message.content);
        },
      },
      {
        type: "button",
        label: trans("message.action.copyJson"),
        onClick: () => {
          showInfoAlert(JSON.stringify(options.message._data));
        },
      },
    ],
  });
}
