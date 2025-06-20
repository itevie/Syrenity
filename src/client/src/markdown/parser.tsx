import Mention, { textToMentionType } from "../components/message/Mention";
import { TokenType, Token } from "./lexer";
import MessageObject from "./objects";

export interface MarkdownParseResult {
  element: JSX.Element;
  objects: MessageObject[];
}

/**
 * Returns a JSX element based off a token
 * @param token The token to give
 * @param data The inner data, leave undefined to use token["data"]
 * @returns The JSX element created
 */
function getElementFor(token: Token | undefined, data?: any): JSX.Element {
  return (
    {
      [TokenType.Bold]: <b>{data ?? token?.data}</b>,
      [TokenType.Italic]: <i>{data ?? token?.data}</i>,
      [TokenType.Underscore]: <u>{data ?? token?.data}</u>,
      [TokenType.Strikethrough]: <del>{data ?? token?.data}</del>,
      [TokenType.Code]: <code>{data ?? token?.data}</code>,
    }[token?.type.toString() ?? "none"] ?? <label>{data ?? token!.data}</label>
  );
}

/**
 * Returns a JSX element tree based off lexed tokens
 * @param tokens The tokens to create the tree off of
 * @returns The resulting JSX element
 */
export default function parse(tokens: Token[]): MarkdownParseResult {
  let objects: MessageObject[] = [];

  /**
   * @returns The current token
   */
  function at() {
    return tokens[0];
  }

  /**
   * Removes the first element from tokens
   * @returns The element removed
   */
  function eat() {
    return tokens.shift();
  }

  /**
   * Combines multiple tokens into 1 JSX element
   * @param tokens
   * @returns The combined element
   */
  function combine(tokens: (Token | JSX.Element)[]): JSX.Element {
    return (
      <>
        {tokens.map((x) =>
          typeof x === "object" && "type" in x && "data" in x
            ? getElementFor(x)
            : x,
        )}
      </>
    );
  }

  /**
   * Returns a token if the current token is one of type[], otherwise returns JSX element
   * @param type The types to allow
   * @param also The previous tokens to add onto it
   * @returns [true, Token] if it matched, [false, JSX.Element] if it didn't, if so, it should early return
   */
  function expect(
    type: TokenType[],
    also?: Token[],
  ): [false, JSX.Element] | [true, Token] {
    if (type.includes(at().type)) {
      return [true, eat()!];
    } else {
      return [false, combine([...(also || []), eat()!])];
    }
  }

  /**
   * The very first part of the parser
   */
  function pre(): JSX.Element {
    let parts: JSX.Element[] = [];
    while (tokens.length != 0) {
      parts.push(base());
    }
    return <>{parts}</>;
  }

  /**
   * Base things like bold, italic
   */
  function base(): JSX.Element {
    if (
      [
        TokenType.Bold,
        TokenType.Italic,
        TokenType.Underscore,
        TokenType.Strikethrough,
        TokenType.Code,
      ].includes(at().type)
    ) {
      let t = eat();
      let inner: JSX.Element[] = [];

      while (tokens.length !== 0 && at().type !== t?.type) {
        inner.push(base());
      }

      if (at()?.type === t?.type) eat();
      return getElementFor(t, inner);
    } else {
      return mention();
    }
  }

  /**
   * Mentions
   */
  function mention(): JSX.Element {
    if (at()?.type === TokenType.OpenAngle) {
      // Get mention type [@]
      let _1 = eat()!;
      let mentionType = expect(
        [TokenType.At, TokenType.Hashtag, TokenType.File],
        [_1],
      );
      if (!mentionType[0]) return mentionType[1];

      // Get ID
      let idTok = expect([TokenType.Text], [_1, mentionType[1]]);
      if (!idTok[0]) return idTok[1];

      // Get closing
      let closing = expect(
        [TokenType.CloseAngle],
        [_1, mentionType[1], idTok[1]],
      );
      if (!closing[0]) return closing[1];

      if (mentionType[1].type === TokenType.At)
        objects.push({
          type: "mention",
          userId: parseInt(idTok[1].data),
          isEveryone: false,
        });
      else if (mentionType[1].type === TokenType.File)
        objects.push({
          type: "file",
          fileId: idTok[1].data,
        });

      return (
        <Mention
          type={textToMentionType(mentionType[1].data)}
          id={idTok[1].data.trim()}
        />
      );
    } else {
      return last();
    }
  }

  /**
   * The very last part, it just auto returns the data.
   */
  function last(): JSX.Element {
    if (at().type === TokenType.Newline) {
      eat();
      return <br />;
    } else if (at().type === TokenType.Link) {
      let url = eat();
      objects.push({
        type: "link",
        url: url?.data!,
      });
      return <a href={url?.data}>{url?.data}</a>;
    } else if (at().type === TokenType.CloseAngle) {
      let text = eat()?.data;
      while (tokens.length !== 0 && at().type === TokenType.Text) {
        text += eat()?.data ?? "";
      }
      return <label style={{ color: "green" }}>{text}</label>;
    }
    return <label>{eat()?.data}</label>;
  }

  return {
    element: pre(),
    objects,
  };
}
