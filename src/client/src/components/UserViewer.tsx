import Column from "../dawn-ui/components/Column";
import Container from "../dawn-ui/components/Container";
import Row from "../dawn-ui/components/Row";
import Tabbed from "../dawn-ui/components/Tabbed";
import Words, { TextType } from "../dawn-ui/components/Words";
import { useAppSelector } from "../stores/store";
import { fixUrlWithProxy } from "../util";
import UserIcon from "./UserIcon";
import File from "../syrenity-client/structures/File";
import { useTranslation } from "react-i18next";
import DateText from "./DateText";
import { setFullscreenImage } from "../dawn-ui/components/ImageViewer";
import showImageContextMenu from "./context-menus/imageContextMenu";

export default function UserViewer({ userId }: { userId: number }) {
  const users = useAppSelector((x) => x.users);
  const { t } = useTranslation();

  return (
    <Container className="sy-user-viewer" onClick={(e) => {}}>
      <Column>
        {users[userId].profile_banner ? (
          <img
            className="sy-user-viewer-banner clickable"
            src={fixUrlWithProxy(File.check(users[userId].profile_banner))}
            onClick={() => {
              setFullscreenImage({
                image: fixUrlWithProxy(
                  File.check(users[userId].profile_banner),
                ),
                onContextMenu: showImageContextMenu,
              });
            }}
          ></img>
        ) : (
          <div className="sy-user-viewer-banner"></div>
        )}

        <Row className="sy-user-viewer-below-banner">
          <UserIcon
            id={userId}
            size="128px"
            quality={512}
            onClick={() => {
              setFullscreenImage({
                image: fixUrlWithProxy(File.check(users[userId].avatar)),
                onContextMenu: showImageContextMenu,
              });
            }}
          />
          <Row
            util={["small-gap", "align-center"]}
            className="sy-user-viewer-username"
          >
            <Words type={TextType.Heading} style={{ fontSize: "1.5em" }}>
              {users[userId].username}
            </Words>
            <small>#{users[userId].discriminator}</small>
          </Row>
        </Row>
        <Column className="sy-user-viewer-main-content">
          <Tabbed>
            {{
              [t("userViewer.aboutMe.name")]: (
                <Column>
                  <Words type={TextType.Heading}>
                    {t("userViewer.aboutMe.joined")}
                  </Words>
                  <Words>
                    <DateText date={new Date(users[userId].created_at)} />
                  </Words>
                </Column>
              ),
            }}
          </Tabbed>
        </Column>
      </Column>
    </Container>
  );
}
