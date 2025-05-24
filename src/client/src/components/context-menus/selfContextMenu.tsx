import { client } from "../../App";
import showSettingsPage from "../../app-pages/SettingsPage";
import {
  addAlert,
  closeAlert,
  showInfoAlert,
} from "../../dawn-ui/components/AlertManager";
import Button from "../../dawn-ui/components/Button";
import Column from "../../dawn-ui/components/Column";
import { showContextMenu } from "../../dawn-ui/components/ContextMenuManager";
import Row from "../../dawn-ui/components/Row";
import uploadFile from "../../dawn-ui/uploadFile";

export function showSelfContextMenu(
  e: React.MouseEvent<HTMLImageElement, MouseEvent>,
) {
  showContextMenu({
    event: e,
    elements: [
      {
        type: "button",
        label: "Settings",
        onClick() {
          showSettingsPage();
        },
        /*

          */
      },
      {
        type: "seperator",
      },
      {
        type: "button",
        scheme: "danger",
        label: "Logout",
        onClick: () => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        },
      },
      {
        type: "button",
        label: "extra",

        onClick() {
          addAlert({
            title: "Settings",
            body: (
              <Column>
                <label>This is temporary</label>
                <Row>
                  <Button big onClick={() => {}}>
                    Change app hue
                  </Button>
                </Row>
              </Column>
            ),
            buttons: [
              {
                text: "Close",
                id: "close",
                click(close) {
                  close();
                },
              },
            ],
          });
        },
      },
    ],
  });
}
