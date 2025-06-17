import { setTransparency } from "../../components/PageManager";
import Column from "../../dawn-ui/components/Column";
import Range from "../../dawn-ui/components/Range";
import Words, { TextType } from "../../dawn-ui/components/Words";
import { trans } from "../../i18n";

export default function AppearanceSettings() {
  return (
    <Column>
      <Words type={TextType.Heading}>
        {trans("settings.appAppearance.theme")}
      </Words>
      <Range
        name={trans("settings.appAppearance.hue")}
        defaultValue={localStorage.getItem("sy-app-hue") ?? "300"}
        onChange={(e) => {
          setTransparency();
          document.body.style.setProperty(
            "--sy-base-color",
            e.currentTarget.value,
          );
          localStorage.setItem("sy-app-hue", e.currentTarget.value.toString());
        }}
        min="0"
        max="360"
      />
    </Column>
  );
}
