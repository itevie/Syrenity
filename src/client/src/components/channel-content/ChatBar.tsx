import EmojiPicker from "emoji-picker-react";
import { client } from "../../App";
import {
  showLoadingAlert,
  addAlert,
} from "../../dawn-ui/components/AlertManager";
import GoogleMatieralIcon from "../../dawn-ui/components/GoogleMaterialIcon";
import Row from "../../dawn-ui/components/Row";
import uploadFile from "../../dawn-ui/uploadFile";
import { isErr, handleClientError, wrap } from "../../util";
import showEmojiPickerAlert from "../alerts/emojiPickerAlert";
import "./chat-bar.css";
import { useTranslation } from "react-i18next";

export default function ChatBar({
  inputRef,
  onKey,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="sy-messageinput-container">
      <Row
        util={["no-shrink", "small-gap", "align-center"]}
        className="sy-messageinput"
      >
        <GoogleMatieralIcon
          name="add"
          util={["clickable"]}
          onClick={async () => {
            const loader = showLoadingAlert();
            const data = await uploadFile();
            loader.stop();

            if (!data) return;

            const file = await wrap(
              client.files.upload(data.name, data.result),
            );

            if (isErr(file)) {
              return handleClientError("upload file", file.v);
            }

            if (inputRef.current) inputRef.current.value += `<f:${file.v.id}>`;
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
