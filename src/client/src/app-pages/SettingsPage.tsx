import { client } from "../App";
import Page from "../components/Page";
import { setPage } from "../components/PageManager";
import { closeAlert, showInfoAlert } from "../dawn-ui/components/AlertManager";
import Button from "../dawn-ui/components/Button";
import Column from "../dawn-ui/components/Column";
import InputWithName from "../dawn-ui/components/InputWithName";
import Range from "../dawn-ui/components/Range";
import Row from "../dawn-ui/components/Row";
import Words, { TextType } from "../dawn-ui/components/Words";
import uploadFile from "../dawn-ui/uploadFile";

export default function showSettingsPage() {
  setPage(
    <Page
      options={{
        sections: [
          {
            type: "button",
            label: "Account",
            icon: "face",
            element: (
              <>
                <Button
                  onClick={async () => {
                    const result = await uploadFile("image/*");
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
                  Change Pfp
                </Button>
                <Button
                  onClick={async () => {
                    const result = await uploadFile("image/*");
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
                  Change Banner
                </Button>
              </>
            ),
          },
          {
            type: "br",
          },
          {
            type: "button",
            label: "App Appearance",
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
