import { HTMLAttributes } from "react";
import lex from "./lexer";
import parse from "./parser";

export default function Markdown({
  children,
  ...rest
}: { children: string } & HTMLAttributes<HTMLLabelElement>) {
  // TODO: Make it also return a list of embeds that the parser found.
  return <label {...rest}>{parse(lex(children))}</label>;
}
