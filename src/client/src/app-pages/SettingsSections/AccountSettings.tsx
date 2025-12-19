import { client } from "../../App";
import { uploadImageAlert } from "../../components/alerts/uploadImage";
import UserViewer from "../../components/UserViewer";
import {
  closeAlert,
  showInfoAlert,
  showInputAlert,
} from "../../dawn-ui/components/AlertManager";
import Button from "../../dawn-ui/components/Button";
import Column from "../../dawn-ui/components/Column";
import Row from "../../dawn-ui/components/Row";
import { trans } from "../../i18n";
import { handleClientError, isErr, wrap } from "../../util";

export default function AccountSettings() {
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Column>
        <Button
          onClick={async () => {
            const result = await showInputAlert("Enter new username");
            if (!result || result === client.user?.username) return;

            let r = await wrap(
              client.user!.edit({
                username: result,
              }),
            );

            if (isErr(r)) {
              handleClientError("change username", r.v);
            }
          }}
        >
          {trans("settings.account.changeUsername")}
        </Button>
        <Button
          onClick={async () => {
            const result = await uploadImageAlert();
            if (!result) return;
            const file = await client.files.upload(result.name, result.result);
            await client.user?.edit({
              avatar: file.id,
            });
            closeAlert();
            showInfoAlert("Updated!");
          }}
        >
          {trans("settings.account.changePfp")}
        </Button>
        <Button
          onClick={async () => {
            const result = await uploadImageAlert();
            if (!result) return;
            const file = await client.files.upload(result.name, result.result);
            await client.user?.edit({
              profile_banner: file.id,
            });
            closeAlert();
            showInfoAlert("Updated!");
          }}
        >
          {trans("settings.account.changeBanner")}
        </Button>
        <Button
          onClick={async () => {
            const aboutMe = await showInputAlert(
              "Enter about me:",
              client.user?.about,
            );
            if (!aboutMe) return;

            await client.user?.edit({
              about_me: aboutMe,
            });
            showInfoAlert("Updated!");
          }}
        >
          {trans("settings.account.changeAboutMe")}
        </Button>
      </Column>
      {client.user ? <UserViewer userId={client.user.id} /> : "Loading..."}
    </Row>
  );
}
