import { useRef, useState } from "react";
import Words, { TextType } from "../../dawn-ui/components/Words";

export default function Timestamp({ date }: { date: Date }) {
  const now = new Date();
  const input = new Date(date);

  const isToday = now.toDateString() === input.toDateString();
  const isYesterday =
    new Date(now.getTime() - 86400000).toDateString() === input.toDateString();

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const time = timeFormatter.format(input);

  const make = (absolute: boolean = false) => {
    if (isToday && !absolute) {
      return `Today at ${time}`;
    } else if (isYesterday && !absolute) {
      return `Yesterday at ${time}`;
    } else {
      const dateFormatter = new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${dateFormatter.format(input)} at ${time}`;
    }
  };

  const ref = useRef<HTMLInputElement>(null);
  const [text, setText] = useState<string>(make());

  return (
    <Words
      onMouseOver={() => {
        setText(make(true));
      }}
      onMouseLeave={() => {
        setText(make(false));
      }}
      type={TextType.Small}
    >
      {text}
    </Words>
  );
}
