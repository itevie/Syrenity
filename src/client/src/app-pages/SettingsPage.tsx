import { useEffect, useState } from "react";
import Page from "../components/Page";
import { setPage } from "../components/PageManager";
import { trans } from "../i18n";
import AccountSettings from "./SettingsSections/AccountSettings";
import AppearanceSettings from "./SettingsSections/AppearanceSettings";
import DeveloperApps from "./SettingsSections/DeveloperApps";
import { ServerSettings } from "../syrenity-client/client/Client";
import { client } from "../App";

function SettingsPage() {
  const [settings, setSettings] = useState<ServerSettings | null>(null);

  useEffect(() => {
    (async () => {
      setSettings(await client.fetchServerSettings());
    })();
  }, []);

  return (
    <Page
      options={{
        sections: [
          {
            type: "button",
            label: trans("settings.account.name"),
            icon: "face",
            element: <AccountSettings />,
          },
          {
            type: "br",
          },
          {
            type: "button",
            label: trans("settings.appAppearance.name"),
            icon: "contrast",
            element: <AppearanceSettings />,
          },
          {
            type: "br",
          },
          {
            type: "button",
            label: trans("settings.developerBots.name"),
            icon: "smart_toy",
            element: <DeveloperApps />,
          },
          {
            type: "br",
          },
          {
            type: "label",
            label: !settings
              ? "..."
              : `${settings.version.git.abbrId} - ${settings.version.git.message}`,
          },
        ],
      }}
    />
  );
}

export default function showSettingsPage() {
  setPage(<SettingsPage></SettingsPage>);
}
