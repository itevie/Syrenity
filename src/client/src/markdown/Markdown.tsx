import { HTMLAttributes } from "react";
import lex from "./lexer";
import parse from "./parser";

export default function Markdown({
  children,
  ...rest
}: { children: string } & HTMLAttributes<HTMLLabelElement>) {
  return <label {...rest}>{parse(lex(children))}</label>;
}
