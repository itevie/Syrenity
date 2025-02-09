import {
  ContextMenuEvent,
  showContextMenu,
} from "../dawn-ui/components/ContextMenuManager";

export default function showImageContextMenu(e: ContextMenuEvent, url: string) {
  console.log("image viewer", e);
  showContextMenu({
    event: e,
    elements: [
      {
        label: "Copy Media Link",
        type: "button",
        onClick() {
          window.navigator.clipboard.writeText(url);
        },
      },
      {
        label: "Open in new tab",
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
