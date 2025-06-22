export enum TokenType {
  Bold,
  Italic,
  Underscore,
  Code,
  Text,
  OpenAngle,
  CloseAngle,
  At,
  Hashtag,
  File,
  Server,
  Strikethrough,
  Link,
  Newline,
}

export interface Token {
  type: TokenType;
  data: string;
}

type TokenRule = {
  match: string;
  type: TokenType;
  length: number;
};

const staticRules: TokenRule[] = [
  // Basic Markdown
  { match: "**", type: TokenType.Bold, length: 2 },
  { match: "*", type: TokenType.Italic, length: 1 },
  { match: "__", type: TokenType.Underscore, length: 2 },
  { match: "~~", type: TokenType.Strikethrough, length: 2 },
  { match: "`", type: TokenType.Code, length: 1 },
  { match: "\n", type: TokenType.Newline, length: 1 },
  // Mentions
  { match: "<", type: TokenType.OpenAngle, length: 1 },
  { match: ">", type: TokenType.CloseAngle, length: 1 },
  { match: "@", type: TokenType.At, length: 1 },
  { match: "#", type: TokenType.Hashtag, length: 1 },
  { match: "f:", type: TokenType.File, length: 2 },
  { match: "s:", type: TokenType.Server, length: 2 },
];

export default function lex(contents: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < contents.length) {
    const ch = contents[index];

    if (ch === "\\") {
      index++;

      // if (contents[index] === "n") {
      //   tokens.push({ type: TokenType.Newline, data: "\n" });
      //   index++;
      //   continue;
      // }

      const escaped = contents[index++] ?? "";
      tokens.push({ type: TokenType.Text, data: escaped });
      continue;
    }

    const rule = staticRules.find((rule) =>
      contents.startsWith(rule.match, index),
    );

    if (rule) {
      tokens.push({ type: rule.type, data: rule.match });
      index += rule.length;
      continue;
    } else if (contents.startsWith("https://", index)) {
      let url = "https://";
      index += url.length;
      while (
        index < contents.length &&
        contents[index].match(/[A-Za-z0-9:/?#@!$&'*+,;=._~%\[\]-]/)
      ) {
        url += contents[index++];
      }
      try {
        new URL(url);
        tokens.push({ type: TokenType.Link, data: url });
      } catch {
        tokens.push({ type: TokenType.Text, data: url });
      }
      continue;
    }

    const last = tokens[tokens.length - 1];
    if (last?.type === TokenType.Text) {
      last.data += contents[index++];
    } else {
      tokens.push({ type: TokenType.Text, data: contents[index++] });
    }
  }

  return tokens;
}
