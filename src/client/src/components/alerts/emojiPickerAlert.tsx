import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { addAlert } from "../../dawn-ui/components/AlertManager";
import Row from "../../dawn-ui/components/Row";

export interface EmojiPickerAlertOptions {
  select: (emoji: EmojiClickData) => void;
}

export default function showEmojiPickerAlert(config: EmojiPickerAlertOptions) {
  addAlert({
    title: "Emoji",
    body: (
      <Row util={["align-center", "justify-center"]}>
        <EmojiPicker
          onEmojiClick={(emoji) => {
            config.select(emoji);
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
}
