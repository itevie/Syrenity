import {
  addAlert,
  closeAlert,
  showErrorAlert,
  showInputAlert,
} from "../../dawn-ui/components/AlertManager";
import IconButton from "../../dawn-ui/components/IconButton";
import Row from "../../dawn-ui/components/Row";
import uploadFile from "../../dawn-ui/uploadFile";
import { guessFileNameFromUrl } from "../../dawn-ui/util";

export function uploadImageAlert(): Promise<{
  name: string;
  result: string;
} | null> {
  return new Promise((resolve, reject) => {
    async function upload() {
      closeAlert();
      const result = await uploadFile("image/*");
      resolve(result);
    }

    async function link() {
      const link = await showInputAlert("Enter file link:");
      if (!link) return;

      try {
        new URL(link);
        closeAlert();
        resolve({ name: guessFileNameFromUrl(link), result: link });
      } catch {
        showErrorAlert("Invalid link!");
      }
    }

    addAlert({
      title: "Upload Image",
      body: (
        <>
          <Row>
            <IconButton
              big
              icon="photo_camera"
              text="Upload"
              onClick={upload}
            />
            <IconButton big icon="link" text="Use Link" onClick={link} />
          </Row>
        </>
      ),
      buttons: [
        {
          id: "cancel",
          text: "Cancel",
          click() {
            closeAlert();
          },
        },
      ],
    });
  });
}
