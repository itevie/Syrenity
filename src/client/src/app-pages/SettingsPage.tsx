import { client } from "../App";
import { uploadImageAlert } from "../components/alerts/uploadImage";
import Page from "../components/Page";
import { setPage } from "../components/PageManager";
import UserViewer from "../components/UserViewer";
import UserViewerManager from "../components/UserViewerManager";
import { closeAlert, showInfoAlert } from "../dawn-ui/components/AlertManager";
import Button from "../dawn-ui/components/Button";
import Column from "../dawn-ui/components/Column";
import InputWithName from "../dawn-ui/components/InputWithName";
import Range from "../dawn-ui/components/Range";
import Row from "../dawn-ui/components/Row";
import Words, { TextType } from "../dawn-ui/components/Words";
import uploadFile from "../dawn-ui/uploadFile";
import { trans } from "../i18n";

export default function showSettingsPage() {
  setPage(
    <Page
      options={{
        sections: [
          {
            type: "button",
            label: trans("settings.account.name"),
            icon: "face",
            element: (
              <Row style={{ justifyContent: "space-between" }}>
                <Column>
                  <Button
                    onClick={async () => {
                      const result = await uploadImageAlert();
                      if (!result) return;
                      const file = await client.files.upload(
                        result.name,
                        result.result,
                      );
                      await client.user?.edit({
                        avatar: file.id,
                      });
                      closeAlert();
                      showInfoAlert("Updated!");
                    }}
                  >
                    {trans("settings.account.changePfp")}
                  </Button>
                  <Button
                    onClick={async () => {
                      const result = await uploadFile("image/*");
                      if (!result) return;
                      const file = await client.files.upload(
                        result.name,
                        result.result,
                      );
                      await client.user?.edit({
                        profile_banner: file.id,
                      });
                      closeAlert();
                      showInfoAlert("Updated!");
                    }}
                  >
                    {trans("settings.account.changeBanner")}
                  </Button>
                </Column>
                {client.user ? (
                  <UserViewer userId={client.user.id} />
                ) : (
                  "Loading..."
                )}
              </Row>
            ),
          },
          {
            type: "br",
          },
          {
            type: "button",
            label: trans("settings.appAppearance.name"),
            icon: "contrast",
            element: (
              <Column>
                <Words type={TextType.Heading}>Theme</Words>
                <Range
                  name="Hue"
                  defaultValue={localStorage.getItem("sy-app-hue") ?? "300"}
                  onChange={(e) => {
                    document.body.style.setProperty(
                      "--sy-base-color",
                      e.currentTarget.value,
                    );
                    localStorage.setItem(
                      "sy-app-hue",
                      e.currentTarget.value.toString(),
                    );
                  }}
                  min="0"
                  max="360"
                />
              </Column>
            ),
          },
        ],
      }}
    />,
  );
}
