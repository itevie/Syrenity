import { updateContextMenu } from "../../dawn-ui/components/ContextMenuManager";

export function showSelfContextMenu(
  e: React.MouseEvent<HTMLImageElement, MouseEvent>,
) {
  updateContextMenu(e, {
    elements: [],
  });
}
