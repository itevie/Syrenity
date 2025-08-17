import React from "react";
import Mention, { textToMentionType } from "../components/message/Mention";
import { TokenType, Token } from "./lexer";
import MessageObject from "./objects";

export interface MarkdownParseResult {
  element: JSX.Element;
  objects: MessageObject[];
}

const FORMATTING = new Set([
  TokenType.Bold,
  TokenType.Italic,
  TokenType.Underscore,
  TokenType.Strikethrough,
  TokenType.Code,
]);

function isToken(x: any): x is Token {
  return !!x && typeof x === "object" && "type" in x && "data" in x;
}

function getElementFor(token?: Token, data?: React.ReactNode): JSX.Element {
  const content = data ?? token?.data ?? "";
  if (!token) return <label>{content}</label>;

  switch (token.type) {
    case TokenType.Bold:
      return <b>{content}</b>;
    case TokenType.Italic:
      return <i>{content}</i>;
    case TokenType.Underscore:
      return <u>{content}</u>;
    case TokenType.Strikethrough:
      return <del>{content}</del>;
    case TokenType.Code:
      return <code>{content}</code>;
    default:
      return <label>{content}</label>;
  }
}

export default function parse(tokens: Token[]): MarkdownParseResult {
  const objects: MessageObject[] = [];
  let i = 0;

  const at = () => {
    const t = tokens[i];
    if (!t) {
      throw new Error(
        `Unexpected end of tokens. prev: ${JSON.stringify(tokens[i - 1])} full: ${tokens
          .map((x) => x.data)
          .join("")}`,
      );
    }
    return t;
  };
  const eat = () => tokens[i++];
  const end = () => i >= tokens.length;
  const prev = () => tokens[i - 1];

  const combine = (parts: (Token | JSX.Element)[]) => (
    <>
      {parts.map((p, idx) =>
        isToken(p) ? (
          getElementFor(p)
        ) : (
          <React.Fragment key={idx}>{p}</React.Fragment>
        ),
      )}
    </>
  );

  type ExpectResult =
    | { ok: true; token: Token }
    | { ok: false; node: JSX.Element };
  const expect = (
    types: TokenType[],
    extra?: (Token | JSX.Element)[],
  ): ExpectResult => {
    if (end()) return { ok: false, node: combine(extra ?? []) };
    if (types.includes(at().type)) return { ok: true, token: eat()! };
    return { ok: false, node: combine([...(extra ?? []), eat()!]) };
  };

  function parseAll(): JSX.Element {
    const parts: JSX.Element[] = [];
    while (!end()) parts.push(parseBase());
    return <>{parts}</>;
  }

  function parseBase(): JSX.Element {
    const t = at();
    if (FORMATTING.has(t.type)) {
      const opener = eat();
      const inner: JSX.Element[] = [];
      while (!end() && at().type !== opener.type) inner.push(parseBase());
      if (!end() && at().type === opener.type) eat();
      return getElementFor(opener, inner);
    }
    return parseMention();
  }

  function parseMention(): JSX.Element {
    if (at().type !== TokenType.OpenAngle) return parseLast();

    const open = eat()!;
    const mentionType = expect(
      [TokenType.At, TokenType.Hashtag, TokenType.File],
      [open],
    );
    if (!mentionType.ok) return mentionType.node;

    const idTok = expect([TokenType.Text], [open, mentionType.token]);
    if (!idTok.ok) return idTok.node;

    const closing = expect(
      [TokenType.CloseAngle],
      [open, mentionType.token, idTok.token],
    );
    if (!closing.ok) return closing.node;

    const id = idTok.token.data.trim();

    if (mentionType.token.type === TokenType.At) {
      if (id === "everyone") {
        objects.push({ type: "mention", userId: -1, isEveryone: true });
      } else {
        objects.push({
          type: "mention",
          userId: parseInt(id, 10),
          isEveryone: false,
        });
      }
    } else if (mentionType.token.type === TokenType.File) {
      objects.push({ type: "file", fileId: idTok.token.data });
    }

    return (
      <Mention
        type={textToMentionType(mentionType.token.data)}
        id={idTok.token.data}
        isEveryone={id === "everyone"}
      />
    );
  }

  function parseLast(): JSX.Element {
    const t = at();
    switch (t.type) {
      case TokenType.Newline: {
        eat();
        return <br />;
      }
      case TokenType.Link: {
        const url = eat()!;
        objects.push({ type: "link", url: url.data });
        return <a href={url.data}>{url.data}</a>;
      }
      case TokenType.CloseAngle: {
        if (!prev() || prev()?.type === TokenType.Newline) {
          let text = eat()?.data ?? "";
          while (!end() && at().type !== TokenType.Newline)
            text += eat()?.data ?? "";
          return <label style={{ color: "green" }}>{text}</label>;
        } else {
          return <label>{eat()?.data}</label>;
        }
      }
      default:
        return <label>{eat()?.data}</label>;
    }
  }

  return { element: parseAll(), objects };
}
