import { useEffect, useState } from "react";
import { AxiosWrapper } from "../dawn-ui/util";
import { handleClientError, isErr, isOk, wrap } from "../util";
import SyPage from "../components/SyPage";
import { axiosClient, baseUrl } from "../App";
import { InviteAPIData } from "../syrenity-client/structures/Invite";
import Container from "../dawn-ui/components/Container";
import Icon from "../dawn-ui/components/Icon";
import { fallbackImage } from "../config";
import Column from "../dawn-ui/components/Column";
import Words from "../dawn-ui/components/Words";
import Row from "../dawn-ui/components/Row";
import Button from "../dawn-ui/components/Button";
import { MemberAPIData } from "../syrenity-client/structures/Member";
import { ServerAPIData } from "../syrenity-client/structures/Server";
import File from "../syrenity-client/structures/File";

export default function Invite() {
  const [invite, setInvite] = useState<InviteAPIData | null>(null);

  useEffect(() => {
    (async () => {
      const url = window.location.href.match(/invites\/(.+)/);

      const result = await wrap(
        axiosClient.get<InviteAPIData>(baseUrl + `/api/invites/${url?.[1]}`)
      );

      if (isErr(result)) {
        return handleClientError("fetch invite", result.v);
      }

      const servers = await wrap(
        axiosClient.get<ServerAPIData[]>(baseUrl + "/api/users/@me/servers")
      );

      if (
        isOk(servers) &&
        servers.v.data.some((x) => x.id === result.v.data.guild_id)
      ) {
        window.location.href = `/channels/${result.v.data.guild_id}`;
        return;
      }

      console.log(result.v.data, File.check(result.v.data.guild.avatar ?? ""));

      setInvite(result.v.data);
    })();
  }, []);

  async function useInvite() {
    const result = await wrap(
      axiosClient.post<MemberAPIData>(
        baseUrl + `/api/invites/${invite?.id}`,
        {}
      )
    );

    if (isErr(result)) {
      return handleClientError("join server", result.v);
    }

    window.location.href = `/channels/${invite?.guild_id}`;
  }

  return (
    <SyPage>
      <Container>
        {invite === null ? (
          <label>Loading...</label>
        ) : (
          <Column util={["justify-center", "align-center", "small-gap"]}>
            <Icon
              src={baseUrl + File.check(invite?.guild.avatar ?? fallbackImage)}
              fallback={fallbackImage}
              size="128px"
            />
            <Words type="heading">{invite?.guild.name}</Words>
            <label>
              You've been invited to <b>{invite?.guild.name}</b>! How shall you
              respond?
            </label>
            <Row>
              <Button big onClick={() => (window.location.href = "/channels")}>
                Go Home
              </Button>
              <Button big onClick={useInvite}>
                Join!
              </Button>
            </Row>
          </Column>
        )}
      </Container>
    </SyPage>
  );
}
