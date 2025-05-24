import Column from "../dawn-ui/components/Column";
import Container from "../dawn-ui/components/Container";
import Row from "../dawn-ui/components/Row";
import Tabbed from "../dawn-ui/components/Tabbed";
import Words, { TextType } from "../dawn-ui/components/Words";
import { useAppSelector } from "../stores/store";
import { fixUrlWithProxy } from "../util";
import { setFullscreenImage } from "./ImageViewer";
import UserIcon from "./UserIcon";
import File from "../syrenity-client/structures/File";
import { useTranslation } from "react-i18next";
import { trans } from "../i18n";

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
                    {new Date(users[userId].created_at).toDateString()}
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
