import { useEffect, useState } from "react";
import User, { UserAPIData } from "../syrenity-client/structures/User";
import Fullscreen from "../dawn-ui/components/Fullscreen";
import { useAppSelector } from "../stores/store";
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
