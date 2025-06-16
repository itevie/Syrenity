import { useState, useEffect } from "react";
import { client } from "../App";
import Relationship from "../syrenity-client/structures/Relationship";
import Column from "../dawn-ui/components/Column";
import Container from "../dawn-ui/components/Container";
import Row from "../dawn-ui/components/Row";
import UserIcon from "./UserIcon";
import GoogleMatieralIcon from "../dawn-ui/components/GoogleMaterialIcon";
import Words, { TextType } from "../dawn-ui/components/Words";
import DateText from "./DateText";
import Button from "../dawn-ui/components/Button";
import { useTranslation } from "react-i18next";

export default function FriendList() {
  const { i18n } = useTranslation();
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  useEffect(() => {
    (async () => {
      setRelationships((await client.user?.fetchRelationships()) || []);
    })();
  }, []);

  return (
    <Column>
      {relationships.map((x) => (
        <Container style={{ minHeight: "fit-content" }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Column>
              <Row util={["align-center"]}>
                <UserIcon id={x.user1.id} />
                <GoogleMatieralIcon name="arrow_forward" />
                <UserIcon id={x.user2.id} />
              </Row>
              <Words type={TextType.Small}>
                <DateText date={x.createdAt} />
              </Words>
            </Column>
            <Row style={{ alignSelf: "end" }}>
              <Button big type="danger">
                {i18n.t("friends.list.revoke")}
              </Button>
              <Button big type="normal">
                {i18n.t("friends.list.message")}
              </Button>
            </Row>
          </Row>
        </Container>
      ))}
    </Column>
  );
}
