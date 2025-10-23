import { client } from "../../App";
import {
  showInputAlert,
  showConfirmModel,
} from "../../dawn-ui/components/AlertManager";
import { trans } from "../../i18n";
import { ChannelAPIData } from "../../syrenity-client/structures/Channel";
import { setPage } from "../PageManager";
import ChannelSettings from "../../app-pages/ChannelSettings";
import { ClickEvent, todo } from "../../dawn-ui/util";
import showChannelDetails from "../alerts/channelDetails";
import { updateContextMenu } from "../../dawn-ui/components/ContextMenuManager";

export default function showChannelContextMenu(
  e: ClickEvent,
  channel: ChannelAPIData,
) {
  updateContextMenu(e, {
    elements: [
      {
        type: "button",
        label: trans("channel.action.setPosition"),
        async onClick() {
          const id = await showInputAlert("Enter position");
          const c = await client.channels.fetch(channel.id);
          await c.edit({
            position: parseInt(id ?? "-1"),
          });
        },
      },
      {
        type: "button",
        label: trans("channel.action.settings"),
        onClick() {
          setPage(<ChannelSettings channel={channel} />);
        },
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        label: trans("channel.action.showDetails"),
        onClick() {
          showChannelDetails(channel);
        },
      },
      {
        type: "button",
        label: trans("channel.action.copyId"),
        onClick() {
          window.navigator.clipboard.writeText(channel.id.toString());
        },
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        scheme: "danger",
        label: trans("channel.action.delete"),
        onClick() {
          showConfirmModel(
            trans("channel.action.confirmDelete", {
              name: channel.name,
            }),
            // TODO: Add channel deletion
            () => todo(),
          );
        },
      },
    ],
  });
}
