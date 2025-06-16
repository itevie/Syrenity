import { useEffect, useState } from "react";
import FAB from "../../dawn-ui/components/FAB";
import Application from "../../syrenity-client/structures/Application";
import { client } from "../../App";
import Row from "../../dawn-ui/components/Row";
import Container from "../../dawn-ui/components/Container";
import Column from "../../dawn-ui/components/Column";
import UserIcon from "../../components/UserIcon";
import Words, { TextType } from "../../dawn-ui/components/Words";

export default function DeveloperApps() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    (async () => {
      setApplications(await client.user?.fetchApplications()!);
    })();
  }, []);

  return (
    <>
      <FAB />
      <Column style={{ overflowY: "auto" }}>
        <Row util={["flex-wrap"]}>
          {applications.map((x) => (
            <Container hover util={["fit-content"]}>
              <Column util={["align-center"]} style={{ width: 100 }}>
                <UserIcon id={x.bot.id} />
                <Words>{x.bot.username}</Words>
              </Column>
            </Container>
          ))}
        </Row>
        <Words type={TextType.Small}>
          You have {applications.length} bots!
        </Words>
      </Column>
    </>
  );
}
