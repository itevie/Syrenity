import { useEffect, useState } from "react";
import Message from "../../syrenity-client/structures/Message";
import Row from "../../dawn-ui/components/Row";
import { baseUrl, client } from "../../App";
import File from "../../syrenity-client/structures/File";
import { AxiosResponse } from "axios";
import Logger from "../../dawn-ui/Logger";
import MessageImageAttachment from "../MessageImageAttachment";
import { setFullscreenImage } from "../ImageViewer";
import { fixUrlWithProxy, isErr, wrap } from "../../util";

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
        /<f:[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}>/
      )
    ) {
      const result = message.content.match(
        /<f:([\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12})>/i
      ) as RegExpMatchArray;
      message.content = message.content.replace(result[0], "");
      extractedUrls.push(baseUrl + File.check(result[1]));
    }

    // Create promise array
    const fetchPromises = extractedUrls.slice(0, 10).map(async (url) => {
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
          `Loading ${_url} with content type ${result.v.headers["content-type"]}`
        );

        return _url;
      }
    });

    (async () => {
      const resolved = (await Promise.all(fetchPromises)).filter(
        (x) => x !== null
      ) as string[];

      setEmbeds(
        resolved.map((url) => (
          <MessageImageAttachment
            key={url}
            onLoad={() => {}}
            onClick={(url) => setFullscreenImage(url, resolved)}
            url={url}
          />
        ))
      );
    })();
  }, [message]);

  return embeds.length === 0 ? (
    <></>
  ) : (
    <Row util={["flex-wrap"]}>{embeds.slice(0, 10)}</Row>
  );
}
