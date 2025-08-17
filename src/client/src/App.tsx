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
import ImageViewer from "./dawn-ui/components/ImageViewer";
import Logger from "./dawn-ui/Logger";
import {
  showInputAlert,
  showLoadingAlert,
} from "./dawn-ui/components/AlertManager";
import FullscreenLoader from "./components/FullscreenLoader";
import DmBar from "./components/DmBar";
import { handleClientError, isErr, wrap } from "./util";
import { setUserViewerUser } from "./components/UserViewerManager";
import Column from "./dawn-ui/components/Column";
import Icon from "./dawn-ui/components/Icon";
import File from "./syrenity-client/structures/File";
import { fallbackImage } from "./config";
import { useAppSelector } from "./stores/store";
import { showSelfContextMenu } from "./components/context-menus/selfContextMenu";
import GoogleMatieralIcon from "./dawn-ui/components/GoogleMaterialIcon";
import showSettingsPage from "./app-pages/SettingsPage";
import CommandPaletteManager, {
  CommandPaletteProviderManager,
  fuzzy,
} from "./dawn-ui/components/CommandPaletteManager";
import { AxiosWrapper } from "./dawn-ui/axios";
import { ShortcutManager } from "./dawn-ui/components/ShortcutManager";
import { setPage } from "./components/PageManager";
import { dawnUIConfig } from "./dawn-ui/config";
import { trans } from "./i18n";

export const baseUrl =
  localStorage.getItem("api-url") ??
  (window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `${window.location.protocol}//${window.location.host}`);
dawnUIConfig.baseLocalhostUrl = baseUrl;

export const axiosClient = new AxiosWrapper();
axiosClient.noErrorMessage = true;
if (localStorage.getItem("token"))
  axiosClient.config.headers = {
    Authorization: `Token ${localStorage.getItem("token") as string}`,
  };
axiosClient.config.baseURL = baseUrl;

const BASE_HUE = "30";

let hue = localStorage.getItem("sy-app-hue") ?? BASE_HUE;
document.body.style.setProperty("--sy-base-color", hue);
document.body.style.setProperty("--dawn-accent-base-color", hue);

export let client: Client;
const logger = new Logger("client");
Logger.baseConfig.baseColor = `hsla(${hue}, 45%, 80%, 1)`;
console.log(`hsla(${hue}, 100% 100% 1)`);
const clientDebugLogger = new Logger("client-debug");

//const channelContentStore: Map<number, ReactElement> = new Map();
export let loading = 0;

export function addLoading() {
  loading += 1;
}

export function decLoading() {
  loading -= 1;
}

CommandPaletteProviderManager.register({
  name: "Syrenity Shortcuts",
  exec: (query: string) => {
    if (fuzzy("change api url").match(query)) {
      return [
        {
          name: "Change API Url",
          icon: undefined,
          callback: async () => {
            let n = await showInputAlert("Enter new URL");
            if (n) localStorage.setItem("api-url", n);
            window.location.reload();
          },
        },
      ];
    } else {
      return [];
    }
  },
});

ShortcutManager.registerShortcut("Open Settings", {
  modifiers: ["ctrl"],
  key: "i",
});
ShortcutManager.setShortcutCallback("Open Settings", showSettingsPage);

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
    null,
  );
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

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
      logger.log(`Ready event fired! Reconnected?:`, reconnect);
      loader.stop();
      if (reconnect) return;

      const s = await wrapLoading(user.fetchServers());
      dispatch(handleServers(["ADD", s.map((x) => x._data)]));

      CommandPaletteProviderManager.register({
        name: "Syrenity Servers",
        exec: (query: string) => {
          return s
            .filter((x) => fuzzy(x.name).match(query))
            .map((x) => ({
              name: `Goto ${x.name}`,
              icon: x.avatar?.url,
              callback: () => loadServer(x.id),
            }));
        },
      });

      let path = window.location.pathname.match(
        /channels\/([0-9]+|@me)(\/([0-9]+))?/,
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
    // Check type of server
    logger.log(`Loading server ${id}`);
    if (id === "@me") {
      setSelectedServer("@me");
      return;
    }

    // Load server & channels
    let server = await wrap(client.servers.fetch(id));
    if (isErr(server)) {
      handleClientError("load server", server.v);
    } else {
      setSelectedServer(server.v);
      let channels = await server.v.channels.fetchList();
      dispatch(addChannels(channels.map((x) => x._data)));
    }

    // Check if there's a past channel
    let past = localStorage.getItem(`prev-loaded-channel-${id}`);
    if (past) {
      loadChannel(parseInt(past), id);
    } else {
      setSelectedChannel(null);
    }
  }

  async function loadChannel(id: number, server: number | "@me" | null = null) {
    // Load channel
    let channel = await wrap(client.channels.fetch(id));
    if (isErr(channel)) {
      handleClientError("load channel", channel.v);
    } else {
      setSelectedChannel(channel.v);
    }

    // Set the current loaded channel for the server
    let serverId =
      server ??
      (selectedServer && typeof selectedServer === "object"
        ? selectedServer.id
        : selectedServer);

    if (serverId) {
      localStorage.setItem(`prev-loaded-channel-${serverId}`, id.toString());
    }

    window.history.pushState("", "", `/channels/${serverId}/${id}`);
  }

  return (
    <>
      {showLoader && <FullscreenLoader />}
      <ImageViewer />
      <FullPage>
        <Row style={{ height: "100%" }} util={["no-gap"]}>
          <Column util={["no-gap"]} style={{ maxHeight: "100vh" }}>
            <Row util={["no-gap", "flex-grow", "overflow-y-scroll"]}>
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
            <Row className="sy-accountarea">
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
          <Row>
            <ChannelContent channel={selectedChannel} />
          </Row>
        </Row>
      </FullPage>
    </>
  );
}

export default App;
