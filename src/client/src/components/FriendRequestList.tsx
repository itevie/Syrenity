import { useEffect, useState, useTransition } from "react";
import FriendRequest from "../syrenity-client/structures/FriendRequest";
import { client } from "../App";
import Column from "../dawn-ui/components/Column";
import Container from "../dawn-ui/components/Container";
import UserIcon from "./UserIcon";
import GoogleMatieralIcon from "../dawn-ui/components/GoogleMaterialIcon";
import Row from "../dawn-ui/components/Row";
import Button from "../dawn-ui/components/Button";
import { useTranslation } from "react-i18next";

export default function FriendRequestList() {
  const { i18n } = useTranslation();
  const [fqs, setFqs] = useState<FriendRequest[]>([]);

  useEffect(() => {
    (async () => {
      setFqs(await client.user?.fetchFriendRequests()!);
    })();
  }, []);

  return (
    <Column>
      {fqs.map((x) => (
        <Container style={{ minHeight: "fit-content" }}>
          <Row
            util={["align-center"]}
            style={{ justifyContent: "space-between" }}
          >
            <Row util={["align-center"]}>
              <UserIcon id={x.byUser} />
              <GoogleMatieralIcon name="arrow_forward" />
              <UserIcon id={x.forUser} />
            </Row>
            <Row style={{ alignSelf: "end" }}>
              <Button type="danger" big>
                {i18n.t("friends.requests.decline")}
              </Button>
              <Button type="success" big>
                {i18n.t("friends.requests.accept")}
              </Button>
            </Row>
          </Row>
        </Container>
      ))}
    </Column>
  );
}
