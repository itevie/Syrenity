import EmojiPicker, { Theme } from "emoji-picker-react";
import { addAlert, closeAlert } from "../../dawn-ui/components/AlertManager";
import { showContextMenu } from "../../dawn-ui/components/ContextMenuManager";
import Row from "../../dawn-ui/components/Row";
import { isErr, handleClientError, wrap } from "../../util";
import Message from "../../syrenity-client/structures/Message";

export interface MessageContextMenuOptions {
  event: React.MouseEvent<HTMLDivElement, MouseEvent>;
  message: Message;
  edit: () => void;
}

export function showMessageContextMenu(options: MessageContextMenuOptions) {
  showContextMenu({
    event: options.event,
    ignoreClasses: [".dawn-icon", ".sy-attachment-image"],
    elements: [
      {
        type: "button",
        label: "Edit Message",
        onClick() {
          options.edit();
        },
      },
      {
        type: "button",
        label: options.message.isPinned ? "Unpin" : "Pin",
        async onClick() {
          const result = await wrap(
            options.message.isPinned
              ? options.message.unpin()
              : options.message.pin()
          );
          if (isErr(result)) {
            return handleClientError(
              options.message.isPinned ? "unpin" : "pin",
              result.v
            );
          }
        },
      },
      {
        type: "button",
        label: "Delete Message",
        scheme: "danger",
        onClick: async () => {
          const result = await wrap(options.message.delete());
          if (isErr(result)) {
            return handleClientError("delete message", result.v);
          }
        },
      },
      {
        type: "button",
        label: "React",
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
                      options.message.react(emoji.emoji)
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
        type: "seperator",
      },
      {
        type: "button",
        label: "Copy Text",
        onClick: () => {
          window.navigator.clipboard.writeText(options.message.content);
        },
      },
    ],
  });
}
