import Message from "../../syrenity-client/structures/Message";
import remarkGfm from "remark-gfm";
import { showConfirmModel } from "../../dawn-ui/components/AlertManager";
import emoji from "remark-emoji";
import Markdown from "../../markdown/Markdown";

export default function MessageContent({ message }: { message: Message }) {
  return (
    <Markdown
      // remarkPlugins={[remarkGfm, emoji]}
      // components={{
      //   a: ({ node, ...props }) => (
      //     <a
      //       {...props}
      //       onClick={(e) => {
      //         e.preventDefault();
      //         showConfirmModel(
      //           `Are you sure you want to visit ${(e.target as HTMLAnchorElement).href}`,
      //           () => {
      //             const a = document.createElement("a");
      //             a.target = "_blank";
      //             a.href = (e.target as HTMLAnchorElement).href;
      //             a.click();
      //           },
      //         );
      //       }}
      //     />
      //   ),
      // }}
      className={"sy-message-content"}
    >
      {message.content.replace(/\n/g, "  \n")}
    </Markdown>
  );
}
