import { useTranslation } from "react-i18next";
import Page from "../components/Page";
import Words, { TextType } from "../dawn-ui/components/Words";
import { ServerAPIData } from "../syrenity-client/structures/Server";
import Button from "../dawn-ui/components/Button";
import { uploadImageAlert } from "../components/alerts/uploadImage";
import { client } from "../App";

export default function ServerSettings({ server }: { server: ServerAPIData }) {
  const { i18n } = useTranslation();

  return (
    <Page
      options={{
        sections: [
          {
            type: "button",
            label: i18n.t("server.settings.details.name"),
            element: (
              <>
                <Words type={TextType.Heading}>{server.name}</Words>
                <Button
                  onClick={async () => {
                    const result = await uploadImageAlert();
                    if (!result) return;
                    const file = await client.files.upload(
                      result.name,
                      result.result,
                    );
                    const fullServer = await client.servers.fetch(server.id);
                    await fullServer.edit({
                      avatar: file.id,
                    });
                  }}
                >
                  Change Avatar
                </Button>
              </>
            ),
            icon: "settings",
          },
        ],
      }}
    ></Page>
  );
}
