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

export default function ChatBar({
  inputRef,
  onKey,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
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
              client.files.upload(data.name, data.result)
            );

            if (isErr(file)) {
              return handleClientError("upload file", file.v);
            }

            if (inputRef.current) inputRef.current.value += `<f:${file.v.id}>`;
          }}
        />
        <textarea
          ref={inputRef}
          style={{ resize: "none" }}
          className="sy-messageinput-input"
          onKeyUp={onKey}
        />
        <GoogleMatieralIcon
          name="mood"
          util={["clickable"]}
          onClick={() => {
            addAlert({
              title: "Emoji",
              body: (
                <Row util={["align-center", "justify-center"]}>
                  <EmojiPicker
                    onEmojiClick={(emoji) => {
                      if (inputRef.current)
                        inputRef.current.value += emoji.emoji;
                    }}
                  />
                </Row>
              ),
              buttons: [
                {
                  id: "close",
                  text: "Close",
                  click(close) {
                    close();
                  },
                },
              ],
            });
          }}
        />
      </Row>
    </div>
  );
}
