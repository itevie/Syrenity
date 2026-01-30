import { useRef } from "react";
import FullWidthInput from "../dawn-ui/components/FullWidthInput";
import { trans } from "../i18n";

export default function AddFriend() {
  const inputRef = useRef(null);

  async function add() {}

  return (
    <>
      <FullWidthInput name={trans("friends.adding.enter_name")}>
        <input ref={inputRef} />
      </FullWidthInput>
    </>
  );
}
