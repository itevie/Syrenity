import { useEffect, useState } from "react";
import User from "../syrenity-client/structures/User";
import Fullscreen from "../dawn-ui/components/Fullscreen";
import Container from "../dawn-ui/components/Container";
import UserIcon from "./UserIcon";
import Words from "../dawn-ui/components/Words";
import Column from "../dawn-ui/components/Column";
import Row from "../dawn-ui/components/Row";
import Tabbed from "../dawn-ui/components/Tabbed";
import { setFullscreenImage } from "./ImageViewer";

export let setUserViewerUser: (user: User) => void = () => {};

export default function UserViewer() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUserViewerUser = (user) => {
      setUser(user);
    };
  }, []);

  return (
    user && (
      <Fullscreen
        onClick={(e) => {
          if (
            (e.target as HTMLDivElement).classList.contains("dawn-fullscreen")
          )
            setUser(null);
        }}
      >
        <Container className="sy-user-viewer" onClick={(e) => {}}>
          <Column>
            <div className="sy-user-viewer-banner"></div>
            <Row className="sy-user-viewer-below-banner">
              <UserIcon
                id={user?.id}
                size="128px"
                onClick={() => {
                  setFullscreenImage(user.avatar.url, [user.avatar.url]);
                }}
              />
            </Row>
            <Column className="sy-user-viewer-main-content">
              <Row util={["small-gap", "align-center"]}>
                <Words type="heading" style={{ fontSize: "1.5em" }}>
                  {user.username}
                </Words>
                <small>#{user.discriminator}</small>
              </Row>
              <Tabbed>
                {{
                  "About Me": (
                    <Column>
                      <Words type="heading">Joined Syrenity</Words>
                      <Words>{user.createdAt.toDateString()}</Words>
                    </Column>
                  ),
                }}
              </Tabbed>
            </Column>
          </Column>
        </Container>
      </Fullscreen>
    )
  );
}
