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
import ChannelContent, { loadNewMessage } from "./components/ChannelContent";
import { addChannels } from "./stores/channelStore";
import ImageViewer from "./components/ImageViewer";

export let client: Client;

export const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `${window.location.protocol}//${window.location.host}`;

const channelContentStore: Map<number, ReactElement> = new Map();

function App() {
  const dispatch = useDispatch();
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelContent, setChannelContent] = useState<ReactElement | null>(
    null
  );

  useEffect(() => {
    client = new Client({
      baseUrl,
      websocketUrl: baseUrl + "/ws",
    });

    client.on("debug", (msg) => {
      console.log(msg);
    });

    client.on("ready", async (user) => {
      console.log(user);
      const s = await user.fetchServers();
      dispatch(addServers(s.map((x) => x._data)));

      let path = window.location.pathname.match(/channels\/([0-9]+)\/([0-9]+)/);
      if (!path) return;
      let server = parseInt(path[1]);
      let channel = parseInt(path[2]);

      loadServer(server);
      loadChannel(channel);
    });

    client.on("messageCreate", (msg) => {
      loadNewMessage.get(msg.channelID)?.(msg);
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

  async function loadServer(id: number) {
    let server = await client.servers.fetch(id);
    setSelectedServer(server);
    let channels = await server.channels.fetchList();
    console.log("FUCKING LOADED", channels);
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
      <ImageViewer />
      <FullPage>
        <Row style={{ height: "100%" }} util={["no-gap"]}>
          <ServerBar
            selected={selectedServer}
            setSelected={(s) => loadServer(s)}
          />
          <ChannelBar
            selected={selectedChannel}
            setSelected={loadChannel}
            selectedServer={selectedServer}
          />
          <ChannelContent channel={selectedChannel} />
        </Row>
      </FullPage>
    </>
  );
}

export default App;
