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
import { addServers } from "./stores/serverStore";
import ChannelBar from "./components/ChannelBar";
import ChannelContent, {
  messageCreated,
  messageDeleted,
  messageReaction,
  messageUpdated,
} from "./components/ChannelContent";
import { addChannels } from "./stores/channelStore";
import ImageViewer from "./components/ImageViewer";
import Logger from "./dawn-ui/Logger";
import { showLoadingAlert } from "./dawn-ui/components/AlertManager";
import FullscreenLoader from "./components/FullscreenLoader";
import DmBar from "./components/DmBar";

export let client: Client;
const logger = new Logger("client");
const clientDebugLogger = new Logger("client-debug");

export const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `${window.location.protocol}//${window.location.host}`;

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
  const [selectedServer, setSelectedServer] = useState<Server | "@me" | null>(
    null
  );
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
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
      dispatch(addServers(s.map((x) => x._data)));

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

    client.on("messageCreate", (msg) => {
      messageCreated.get(msg.channelID)?.(msg);
    });

    client.on("messageDelete", (m, c) => {
      messageDeleted.get(c)?.(m);
    });

    client.on("messageUpdate", (m) => {
      messageUpdated.get(m.channelID)?.(m);
    });

    client.on("messageReactionAdd", (r, m) => {
      messageReaction.get(m.channelID)?.(m);
    });

    client.on("messageReactionRemove", (r, m) => {
      messageReaction.get(m.channelID)?.(m);
    });

    client.on("serverMemberAdd", async (m) => {
      if (m.userId === client.user?.id) {
        const s = await wrapLoading(client.user.fetchServers());
        dispatch(addServers(s.map((x) => x._data)));
      }
    });

    client.on("apiUserClassCreation", (user) => {
      dispatch(addUser(user));
    });

    client.on("apiMessageClassCreation", async (message) => {
      await client.users.fetch(message.author_id);
    });

    client.on("apiServerClassCreation", async (server) => {
      await client.users.fetch(server.owner_id);
    });

    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
    }

    client.connect(localStorage.getItem("token") as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadServer(id: number | "@me") {
    if (id === "@me") {
      setSelectedServer("@me");
      return;
    }

    let server = await client.servers.fetch(id);
    setSelectedServer(server);
    let channels = await server.channels.fetchList();
    setChannels(channels);
    dispatch(addChannels(channels.map((x) => x._data)));
  }

  async function loadChannel(id: number) {
    let channel = await client.channels.fetch(id);
    setSelectedChannel(channel);

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
          <ChannelContent channel={selectedChannel} />
        </Row>
      </FullPage>
    </>
  );
}

export default App;
