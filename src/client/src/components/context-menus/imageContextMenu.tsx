import { client } from "../../App";
import {
  ContextMenuEvent,
  showContextMenu,
} from "../../dawn-ui/components/ContextMenuManager";
import { trans } from "../../i18n";
import { isErr, isOk, wrap } from "../../util";

export default function showImageContextMenu(e: ContextMenuEvent, url: string) {
  showContextMenu({
    event: e,
    elements: [
      {
        label: trans("file.action.copyMediaLink"),
        type: "button",
        onClick() {
          window.navigator.clipboard.writeText(url);
        },
      },
      {
        label: trans("file.action.copyOriginalUrl"),
        type: "button",
        async onClick() {
          if (url.match(/\/files\/.+/)) {
            const file = await wrap(
              client.files.fetch(url.match(/\/files\/(.+)/)?.[1] as string),
            );

            if (isErr(file) || (isOk(file) && !file.v.originalUrl)) {
              window.navigator.clipboard.writeText(url);
            } else {
              window.navigator.clipboard.writeText(file.v.originalUrl ?? "");
            }
          } else if (url.match(/\/api\/proxy\?url=/)) {
            window.navigator.clipboard.writeText(
              url.match(/\/api\/proxy\?url=(.+)/)?.[1] ?? "",
            );
          }
        },
      },
      {
        label: trans("file.action.openInNewTab"),
        type: "button",
        onClick() {
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.click();
        },
      },
    ],
  });
}
