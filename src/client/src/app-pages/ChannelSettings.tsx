import { useTranslation } from "react-i18next";
import Page from "../components/Page";
import Words, { TextType } from "../dawn-ui/components/Words";
import { ChannelAPIData } from "../syrenity-client/structures/Channel";

export default function ChannelSettings({
  channel,
}: {
  channel: ChannelAPIData;
}) {
  const { i18n } = useTranslation();

  return (
    <Page
      options={{
        sections: [
          {
            type: "button",
            label: i18n.t("channel.settings.details.name"),
            element: (
              <>
                <Words type={TextType.Heading}>{channel.name}</Words>
              </>
            ),
            icon: "settings",
          },
          {
            type: "button",
            label: i18n.t("channel.settings.permissions.name"),
            element: <></>,
            icon: "key",
          },
        ],
      }}
    ></Page>
  );
}
