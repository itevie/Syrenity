import { ReactElement, useEffect, useRef, useState } from "react";
import { Client } from "./syrenity-client/index";
import Row from "./dawn-ui/components/Row";
import Server from "./syrenity-client/structures/Server";
import Channel from "./syrenity-client/structures/Channel";
import Message from "./syrenity-client/structures/Message";
import { useDispatch } from "react-redux";
import { addUser } from "./stores/userStore";
import FullPage from "./dawn-ui/components/FullPage";
import ServerBar from "./components/ServerBar";
import { handleServers } from "./stores/serverStore";
import ChannelBar from "./components/ChannelBar";
import ChannelContent from "./components/channel-content/ChannelContent";
import { addChannels } from "./stores/channelStore";
import ImageViewer from "./components/ImageViewer";
import Logger from "./dawn-ui/Logger";
import { showLoadingAlert } from "./dawn-ui/components/AlertManager";
import FullscreenLoader from "./components/FullscreenLoader";
import DmBar from "./components/DmBar";
import { AxiosWrapper } from "./dawn-ui/util";
import { handleClientError, isErr, wrap } from "./util";
import { setUserViewerUser } from "./components/UserViewer";
import Column from "./dawn-ui/components/Column";
import Icon from "./dawn-ui/components/Icon";
import File from "./syrenity-client/structures/File";
import { fallbackImage } from "./config";
import { useAppSelector } from "./stores/store";
import { showSelfContextMenu } from "./components/context-menus/selfContextMenu";
import GoogleMatieralIcon from "./dawn-ui/components/GoogleMaterialIcon";
import showSettingsPage from "./app-pages/SettingsPage";

export const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `${window.location.protocol}//${window.location.host}`;

export const axiosClient = new AxiosWrapper();
axiosClient.noErrorMessage = true;
axiosClient.config.headers = {
  Authorization: `Token ${localStorage.getItem("token") as string}`,
};

document.body.style.setProperty(
  "--sy-base-color",
  localStorage.getItem("sy-app-hue") ?? "300"
);

export let client: Client;
const logger = new Logger("client");
const clientDebugLogger = new Logger("client-debug");

//const channelContentStore: Map<number, ReactElement> = new Map();
export let loading = 0;

export function addLoading() {
  loading += 1;
}

export function decLoading() {
  loading -= 1;
}

export function wrapLoading<T>(x: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    addLoading();
    x.then((x) => {
      decLoading();
      resolve(x);
    }).catch((e) => {
      decLoading();
      reject(e);
    });
  });
}

function App() {
  const dispatch = useDispatch();
  const users = useAppSelector((x) => x.users);
  const [selectedServer, setSelectedServer] = useState<Server | "@me" | null>(
    null
  );
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedChannel2, setSelectedChannel2] = useState<Channel | null>(
    null
  );
  const [channelContent, setChannelContent] = useState<ReactElement | null>(
    null
  );
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    let loader = showLoadingAlert();

    setTimeout(() => {
      const interval = setInterval(() => {
        if (loading <= 0) {
          clearInterval(interval);
          setShowLoader(false);
        }
      }, 100);
    }, 500);

    client = new Client({
      baseUrl,
      websocketUrl: baseUrl + "/ws",
    });

    client.on("debug", (m) => {
      clientDebugLogger.log(m);
    });

    client.on("ready", async (user, reconnect) => {
      loader.stop();
      if (reconnect) return;

      const s = await wrapLoading(user.fetchServers());
      dispatch(handleServers(["ADD", s.map((x) => x._data)]));

      let path = window.location.pathname.match(
        /channels\/([0-9]+|@me)(\/([0-9]+))?/
      );
      logger.log(`Path is:`, path);
      if (!path) return;

      if (path[1] === "@me") {
        setSelectedServer("@me");
      } else {
        loadServer(parseInt(path[1]));
      }

      let channel = parseInt(path[3]);

      if (channel) loadChannel(channel);
    });

    client.on("disconnect", () => {
      logger.log("Client has disconnected");
      loader = showLoadingAlert();
    });

    client.on("channelCreate", (c) => {
      dispatch(addChannels([c._data]));
    });

    client.on("channelPositionUpdate", async (server, c) => {
      const newChannels = (await server.channels.fetchList())
        .filter((x) => x.guildId === server.id)
        .map((x) => {
          return {
            ...x._data,
            position: c.indexOf(x.id),
          };
        });

      dispatch(addChannels(newChannels));
    });

    client.on("serverMemberAdd", async (m) => {
      if (m.userId === client.user?.id) {
        const s = await wrapLoading(client.user.fetchServers());
        dispatch(handleServers(["ADD", s.map((x) => x._data)]));
      }
    });

    client.on("serverMemberRemove", async (m) => {
      if (m.userId === client.user?.id) {
        dispatch(handleServers(["REMOVE", [m.serverId]]));
      }
    });

    client.on("apiUserClassCreation", (user) => {
      dispatch(addUser(user));
    });

    client.on("apiMessageClassCreation", async (message) => {
      await client.users.fetch(message.author_id);
    });

    client.on("serverUpdate", (server) => {
      dispatch(handleServers(["ADD", [server._data]]));
    });
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
    }

    client.connect(localStorage.getItem("token") as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadServer(id: number | "@me") {
    logger.log(`Loading server ${id}`);
    if (id === "@me") {
      setSelectedServer("@me");
      return;
    }

    let server = await wrap(client.servers.fetch(id));
    if (isErr(server)) {
      handleClientError("load server", server.v);
    } else {
      setSelectedServer(server.v);
      let channels = await server.v.channels.fetchList();
      setChannels(channels);
      dispatch(addChannels(channels.map((x) => x._data)));
    }
  }

  async function loadChannel(id: number) {
    let channel = await wrap(client.channels.fetch(id));
    if (isErr(channel)) {
      handleClientError("load channel", channel.v);
    } else {
      setSelectedChannel(channel.v);
      setSelectedChannel2(await client.channels.fetch(208));
    }

    /* if (!channelContentStore.has(channel.id)) {
      channelContentStore.set(channel.id, <ChannelContent channel={channel} />);
    }

    setChannelContent(channelContentStore.get(channel.id) as ReactElement);*/
  }

  return (
    <>
      {showLoader && <FullscreenLoader />}
      <ImageViewer />
      <FullPage>
        <Row style={{ height: "100%" }} util={["no-gap"]}>
          <Column util={["no-gap"]} style={{ height: "100%" }}>
            <Row util={["no-gap"]} style={{ height: "100%" }}>
              <ServerBar
                selected={selectedServer}
                setSelected={(s) => loadServer(s)}
              />
              {selectedServer === "@me" ? (
                <DmBar
                  selected={selectedChannel}
                  setSelected={loadChannel}
                  selectedServer={null}
                />
              ) : (
                <ChannelBar
                  selected={selectedChannel}
                  setSelected={loadChannel}
                  selectedServer={selectedServer}
                />
              )}
            </Row>
            <Row util={["align-center"]} className="sy-accountarea">
              <Icon
                src={
                  client?.user
                    ? File.check(users[client.user.id as number]?.avatar, 64)
                    : fallbackImage
                }
                size="48px"
                onContextMenu={showSelfContextMenu}
              />
              <div className="flex-grow width-100">
                {users[client?.user?.id as number]?.username}
              </div>
              <Row util={["align-center"]} className="sy-accountarea-actions">
                <GoogleMatieralIcon
                  className="clickable"
                  name="settings"
                  onClick={showSettingsPage}
                />
              </Row>
            </Row>
          </Column>
          <ChannelContent channel={selectedChannel} />
        </Row>
      </FullPage>
    </>
  );
}

export default App;
