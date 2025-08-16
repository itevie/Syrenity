import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { HTMLAttributes } from "react";

export default function SyEmojiPicker({
  select,
  style,
}: {
  select: (emoji: EmojiClickData) => any;
  style: HTMLAttributes<HTMLDivElement>["style"];
}) {
  return (
    <EmojiPicker
      style={style}
      onEmojiClick={(emoji) => {
        select(emoji);
      }}
    />
  );
}
