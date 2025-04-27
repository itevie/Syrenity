import { useEffect, useState } from "react";
import User from "../syrenity-client/structures/User";
import Fullscreen from "../dawn-ui/components/Fullscreen";
import Container from "../dawn-ui/components/Container";
import UserIcon from "./UserIcon";
import Words, { TextType } from "../dawn-ui/components/Words";
import Column from "../dawn-ui/components/Column";
import Row from "../dawn-ui/components/Row";
import Tabbed from "../dawn-ui/components/Tabbed";
import { setFullscreenImage } from "./ImageViewer";
import { useAppSelector } from "../stores/store";
import File from "../syrenity-client/structures/File";
import { fixUrlWithProxy } from "../util";

export let setUserViewerUser: (user: User) => void = () => {};

export default function UserViewer() {
  const users = useAppSelector((x) => x.users);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    setUserViewerUser = (user) => {
      setUserId(user.id);
    };
  }, []);

  return userId === null ? (
    <></>
  ) : (
    <Fullscreen
      onClick={(e) => {
        if ((e.target as HTMLDivElement).classList.contains("dawn-fullscreen"))
          setUserId(null);
      }}
    >
      <Container className="sy-user-viewer" onClick={(e) => {}}>
        <Column>
          {users[userId].profile_banner ? (
            <img
              className="sy-user-viewer-banner clickable"
              src={fixUrlWithProxy(File.check(users[userId].profile_banner))}
              onClick={() => {
                setFullscreenImage(
                  fixUrlWithProxy(File.check(users[userId].profile_banner)),
                );
              }}
            ></img>
          ) : (
            <div className="sy-user-viewer-banner"></div>
          )}

          <Row className="sy-user-viewer-below-banner">
            <UserIcon
              id={userId}
              size="128px"
              onClick={() => {
                setFullscreenImage(
                  fixUrlWithProxy(File.check(users[userId].avatar)),
                );
              }}
            />
          </Row>
          <Column className="sy-user-viewer-main-content">
            <Row util={["small-gap", "align-center"]}>
              <Words type={TextType.Heading} style={{ fontSize: "1.5em" }}>
                {users[userId].username}
              </Words>
              <small>#{users[userId].discriminator}</small>
            </Row>
            <Tabbed>
              {{
                "About Me": (
                  <Column>
                    <Words type={TextType.Heading}>Joined Syrenity</Words>
                    <Words>
                      {new Date(users[userId].created_at).toDateString()}
                    </Words>
                  </Column>
                ),
              }}
            </Tabbed>
          </Column>
        </Column>
      </Container>
    </Fullscreen>
  );
}
