import { useEffect, useState } from "react";
import Message from "../../syrenity-client/structures/Message";
import Row from "../../dawn-ui/components/Row";
import { baseUrl, client } from "../../App";
import File from "../../syrenity-client/structures/File";
import { AxiosResponse } from "axios";
import Logger from "../../dawn-ui/Logger";
import MessageImageAttachment from "../MessageImageAttachment";
import { setFullscreenImage } from "../ImageViewer";
import {
  fixUrlWithProxy,
  handleClientError,
  isErr,
  isOk,
  wrap,
} from "../../util";
import Container from "../../dawn-ui/components/Container";
import Column from "../../dawn-ui/components/Column";
import Words from "../../dawn-ui/components/Words";
import Icon from "../../dawn-ui/components/Icon";
import Button from "../../dawn-ui/components/Button";
import { trans } from "../../i18n";

const logger = new Logger("attachment-loader");

export default function MessageAttachments({ message }: { message: Message }) {
  const [embeds, setEmbeds] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Basic https URLs
    let extractedUrls: string[] = [
      ...(message.content.match(/https?:\/\/[^\s]+/g) ?? []),
    ];

    // Get <f:file-id> type attachments
    while (
      message.content.match(
        /<f:[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}>/,
      )
    ) {
      const result = message.content.match(
        /<f:([\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12})>/i,
      ) as RegExpMatchArray;
      message.content = message.content.replace(result[0], "");
      extractedUrls.push(baseUrl + File.check(result[1]));
    }

    // Create promise array
    const fetchImagePromises = extractedUrls.slice(0, 10).map(async (url) => {
      // Create URL
      const _url = fixUrlWithProxy(url);

      // Fetch
      const result = await wrap<AxiosResponse>(client.rest.get(_url));

      if (isErr(result)) {
        logger.error(`Failed to load: ${_url}`, result.v);
        return null;
      } else {
        // Check type
        if (
          !result.v.headers["content-type"] ||
          !result.v.headers["content-type"].startsWith("image/")
        )
          return null;

        // Done
        logger.log(
          `Loading ${_url} with content type ${result.v.headers["content-type"]}`,
        );

        return _url;
      }
    });

    (async () => {
      let specialNodes: JSX.Element[] = [];
      let invites =
        message.content.match(/https?:\/\/\w+(:\d+)?\/invites\/\w+/g) ?? [];
      for await (const inviteURL of invites) {
        try {
          let url = new URL(inviteURL);
          if (url.origin !== client.options.baseUrl) continue;
          console.log(inviteURL.match(/\w+$/));
          let invite = await wrap(
            client.invites.fetch(inviteURL.match(/\w+$/)![0]),
          );

          if (isOk(invite)) {
            const guild = await client.servers.fetch(invite.v.guildId);
            const inServer = (await client.user?.fetchServers()!).some(
              (x) => x.id === guild.id,
            );

            specialNodes.push(
              <Container style={{ width: "350px" }}>
                <Column>
                  <Words>{trans("invites.invitation")}</Words>
                  <Row util={["align-center"]}>
                    <Icon size="64px" src={guild.avatar?.url ?? ""}></Icon>
                    <Words>{guild.name}</Words>
                  </Row>
                  <Button
                    big
                    disabled={inServer}
                    onClick={async () => {
                      const result = await wrap(invite.v.use());

                      if (isErr(result)) {
                        handleClientError(`join ${guild.name}`, result.v);
                      } else {
                      }
                    }}
                  >
                    {trans(inServer ? "invites.joined" : "invites.join")}
                  </Button>
                </Column>
              </Container>,
            );
          }
        } catch {}
      }

      const resolvedImages = (await Promise.all(fetchImagePromises)).filter(
        (x) => x !== null,
      ) as string[];

      setEmbeds([
        ...resolvedImages.map((url) => (
          <MessageImageAttachment
            key={url}
            onLoad={() => {}}
            onClick={(url) => setFullscreenImage(url, resolvedImages)}
            url={url}
          />
        )),
        ...specialNodes,
      ]);
    })();
  }, [message]);

  return embeds.length === 0 ? (
    <></>
  ) : (
    <Row util={["flex-wrap"]}>{embeds.slice(0, 10)}</Row>
  );
}
