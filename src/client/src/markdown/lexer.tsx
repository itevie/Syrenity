export enum TokenType {
  Bold,
  Italic,
  Underscore,
  Text,
  OpenAngle,
  CloseAngle,
  At,
  Strikethrough,
}

export interface Token {
  type: TokenType;
  data: string;
}

export default function lex(contents: string): Token[] {
  let tokens: Token[] = [];

  let index = 0;

  while (index != contents.length) {
    switch (contents[index]) {
      case "\\":
        index++;
        let bit = contents[index++] ?? "";
        tokens.push({
          data: bit,
          type: TokenType.Text,
        });
        break;
      case "*":
        if (contents[index + 1] === "*") {
          tokens.push({
            type: TokenType.Bold,
            data: "**",
          });
          index += 2;
        } else {
          tokens.push({
            type: TokenType.Italic,
            data: "*",
          });
          index++;
        }
        break;
      case "_":
        if (contents[index + 1] === "_") {
          tokens.push({
            type: TokenType.Underscore,
            data: "__",
          });
          index += 2;
        } else {
          tokens.push({
            type: TokenType.Text,
            data: "_",
          });
          index++;
        }
        break;
      case "~":
        if (contents[index + 1] === "~") {
          tokens.push({
            type: TokenType.Strikethrough,
            data: "~~",
          });
          index += 2;
        } else {
          tokens.push({
            type: TokenType.Text,
            data: "~",
          });
          index++;
        }
        break;
      case "<":
        tokens.push({
          type: TokenType.OpenAngle,
          data: "<",
        });
        index++;
        break;
      case ">":
        tokens.push({
          type: TokenType.CloseAngle,
          data: ">",
        });
        index++;
        break;
      case "@":
        tokens.push({
          type: TokenType.At,
          data: "@",
        });
        index++;
        break;
      default:
        if (tokens[tokens.length - 1]?.type === TokenType.Text) {
          tokens[tokens.length - 1].data += contents[index++];
        } else {
          tokens.push({
            type: TokenType.Text,
            data: contents[index++],
          });
        }
        break;
    }
  }

  return tokens;
}
