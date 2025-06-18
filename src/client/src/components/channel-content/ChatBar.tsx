import { useEffect } from "react";
import { client } from "../../App";
import { showLoadingAlert } from "../../dawn-ui/components/AlertManager";
import GoogleMatieralIcon from "../../dawn-ui/components/GoogleMaterialIcon";
import Row from "../../dawn-ui/components/Row";
import uploadFile from "../../dawn-ui/uploadFile";
import { isErr, handleClientError, wrap } from "../../util";
import showEmojiPickerAlert from "../alerts/emojiPickerAlert";
import { uploadImageAlert } from "../alerts/uploadImage";
import "./chat-bar.css";
import { useTranslation } from "react-i18next";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function ChatBar({
  inputRef,
  onKey,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!inputRef) return;

    inputRef.current?.addEventListener("paste", async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for await (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();

          if (file) {
            const dataUrl = await readFileAsDataURL(file);
            const syFile = await client.files.upload(file.name, dataUrl);
            inputRef.current!.value += `<f:${syFile.id}>`;
          }
        }
      }
    });
  }, [inputRef]);

  return (
    <div className="sy-messageinput-container">
      <Row
        util={[
          "no-shrink",
          "small-gap",
          "align-center",
          "ignore-responsive-mobile",
        ]}
        className="sy-messageinput"
      >
        <GoogleMatieralIcon
          name="add"
          util={["clickable"]}
          onClick={async () => {
            const data = await uploadImageAlert();
            if (!data) return;
            const loader = showLoadingAlert();

            const file = await wrap(
              client.files.upload(data.name, data.result),
            );

            if (isErr(file)) {
              return handleClientError("upload file", file.v);
            }

            if (inputRef.current) inputRef.current.value += `<f:${file.v.id}>`;

            loader.stop();
          }}
        />
        <textarea
          placeholder={t("chatbar.placeholder")}
          autoFocus
          ref={inputRef}
          style={{ resize: "none" }}
          className="sy-messageinput-input"
          onKeyUp={onKey}
        />
        <GoogleMatieralIcon
          name="mood"
          util={["clickable"]}
          onClick={() => {
            showEmojiPickerAlert({
              select: (emoji) => {
                if (inputRef.current) inputRef.current.value += emoji.emoji;
              },
            });
          }}
        />
      </Row>
    </div>
  );
}
