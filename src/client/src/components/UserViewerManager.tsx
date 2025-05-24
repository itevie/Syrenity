import { useEffect, useState } from "react";
import User, { UserAPIData } from "../syrenity-client/structures/User";
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
import "./userViewer.css";
import UserViewer from "./UserViewer";

export let setUserViewerUser: (user: User | UserAPIData) => void = () => {};

export default function UserViewerManager() {
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
      <UserViewer userId={userId} />
    </Fullscreen>
  );
}
