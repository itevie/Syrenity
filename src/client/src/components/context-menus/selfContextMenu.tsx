import { showContextMenu } from "../../dawn-ui/components/ContextMenuManager";

export function showSelfContextMenu(
  e: React.MouseEvent<HTMLImageElement, MouseEvent>,
) {
  showContextMenu({
    event: e,
    elements: [],
  });
}
