import showSettingsPage from "../../app-pages/SettingsPage";
import { showContextMenu } from "../../dawn-ui/components/ContextMenuManager";

export function showSelfContextMenu(
  e: React.MouseEvent<HTMLImageElement, MouseEvent>
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

          onClick() {
            addAlert({
              title: "Settings",
              body: (
                <Column>
                  <label>This is temporary</label>
                  <Row>
                    <Button
                      big
                      onClick={() => {
                        addAlert({
                          title: "Change Hue",
                          body: (
                            <input
                              type="range"
                              min="0"
                              max="360"
                              onChange={(e) => {
                                document.body.style.setProperty(
                                  "--sy-base-color",
                                  e.target.value
                                );
                              }}
                            />
                          ),
                          buttons: [
                            {
                              text: "close",
                              id: "close",
                              click(close) {
                                close();
                              },
                            },
                          ],
                        });
                      }}
                    >
                      Change app hue
                    </Button>
                    <Button
                      big
                      onClick={async () => {
                        const result = await uploadFile("image/*");
                        const file = await client.files.upload(
                          result.name,
                          result.result
                        );
                        await client.user?.edit({
                          avatar: file.id,
                        });
                        closeAlert();
                        showInfoAlert("Updated!");
                      }}
                    >
                      Change PFP
                    </Button>
                    <Button
                      big
                      onClick={async () => {
                        const result = await uploadFile("image/*");
                        const file = await client.files.upload(
                          result.name,
                          result.result
                        );
                        await client.user?.edit({
                          profile_banner: file.id,
                        });
                        closeAlert();
                        showInfoAlert("Updated!");
                      }}
                    >
                      Change Banner
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
    ],
  });
}
