import Page from "../components/Page";
import { setPage } from "../components/PageManager";
import Column from "../dawn-ui/components/Column";
import InputWithName from "../dawn-ui/components/InputWithName";
import Range from "../dawn-ui/components/Range";
import Row from "../dawn-ui/components/Row";
import Words from "../dawn-ui/components/Words";

export default function showSettingsPage() {
  setPage(
    <Page
      options={{
        sections: [
          {
            type: "button",
            label: "Account",
            icon: "face",
            element: <>Account</>,
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
                <Words type="heading">Theme</Words>
                <Range
                  name="Hue"
                  defaultValue={localStorage.getItem("sy-app-hue") ?? "300"}
                  onChange={(e) => {
                    document.body.style.setProperty(
                      "--sy-base-color",
                      e.currentTarget.value
                    );
                    localStorage.setItem(
                      "sy-app-hue",
                      e.currentTarget.value.toString()
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
    />
  );
}
