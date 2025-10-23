import Words from "../../dawn-ui/components/Words";
import lex from "../../markdown/lexer";
import parse from "../../markdown/parser";

export default function Markdown({ children }: { children: string }) {
  return <Words>{parse(lex(children)).element}</Words>;
}
