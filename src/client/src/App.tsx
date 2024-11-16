import React, { useEffect, useRef, useState } from "react";
import { Client } from "./syrenity-client/index";
import Row from "./dawn-ui/components/Row";
import Server from "./syrenity-client/structures/Server";
import Icon from "./dawn-ui/components/Icon";
import Column from "./dawn-ui/components/Column";
import Channel from "./syrenity-client/structures/Channel";
import Button from "./dawn-ui/components/Button";
import Message from "./syrenity-client/structures/Message";
import MessageC from "./components/Message";
import { useDispatch } from "react-redux";
import { addUser } from "./stores/userStore";
import { combineStyles } from "./dawn-ui/util";
import { showContextMenu } from "./dawn-ui/components/ContextMenuManager";
import {
  addAlert,
  showInfoAlert,
  showInputAlert,
} from "./dawn-ui/components/AlertManager";
import FullPage from "./dawn-ui/components/FullPage";

export let client: Client;

export const baseUrl =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "";

function App() {
  const dispatch = useDispatch();
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messageAreaRef = useRef<HTMLDivElement>(null);

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
      setServers(s);

      let path = window.location.pathname.match(/channels\/([0-9]+)\/([0-9]+)/);
      if (!path) return;
      let server = parseInt(path[1]);
      let channel = parseInt(path[2]);

      loadServer(server);
      loadChannel(channel);
    });

    client.on("messageCreate", (msg) => {
      setMessages((old) => {
        scrollToBottom();
        return [...old, msg];
      });
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
  }, []);

  function scrollToBottom() {
    setTimeout(() => {
      if (messageAreaRef.current)
        messageAreaRef.current.scrollTop = messageAreaRef.current?.scrollHeight;
    }, 100);
  }

  async function loadServer(id: number) {
    let server = await client.servers.fetch(id);
    setSelectedServer(server);
    let channels = await server.channels.fetchList();
    setChannels(channels);
  }

  async function loadChannel(id: number) {
    let channel = await client.channels.fetch(id);
    setSelectedChannel(channel);
    let m = await channel.messages.query();
    setMessages(m.reverse());
    scrollToBottom();
    window.history.pushState(
      null,
      "",
      `/channels/${channel.guildId}/${channel.id}`
    );
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    let value = e.currentTarget.value;
    if (e.key === "Enter") {
      e.preventDefault();
      await selectedChannel?.messages.send(value);
      (e.target as HTMLTextAreaElement).value = "";
    }
  }

  function showUserAreaCtx(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
    showContextMenu({
      event: e,
      elements: [
        {
          type: "button",
          scheme: "danger",
          label: "Logout",
          onClick: () => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          },
        },
      ],
    });
  }

  async function joinServerButton() {
    addAlert({
      title: "Join or create a server",
      body: <label>What exciting adventure shall we set ahead on today?</label>,
      buttons: [
        {
          id: "close",
          text: "Close",
          click: (c) => {
            c();
          },
        },
        {
          id: "join",
          text: "Join",
          click: async () => {
            const input = await showInputAlert("Enter Invite Code");
            if (!input) return;
          },
        },
        {
          id: "create",
          text: "Create",
          click: async () => {
            const name = await showInputAlert("Enter the server name");
            if (!name) return;
            const server = await client.createServer(name);
            console.log(server);
          },
        },
      ],
    });
  }

  async function serverContext(
    id: number,
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) {
    showContextMenu({
      event: e,
      elements: [
        {
          type: "button",
          label: "Create Invite",
          onClick: async () => {
            const guild = await client.servers.fetch(id);
            const invite = await guild.invites.create();
            showInfoAlert(invite.id);
          },
        },
      ],
    });
  }

  return (
    <FullPage>
      <Row style={{ height: "100%" }}>
        <Column util={["no-shrink"]} className="sy-serverbar">
          <Column util={["no-shrink", "align-center"]} className="sy-topbar">
            <Icon src="/public/images/logos/no_shape_logo.png" size="50px" />
          </Column>
          <Column
            util={["align-center", "flex-grow"]}
            className="sy-serverlist"
          >
            {servers.map((s) => (
              <Icon
                key={`pfp-${s.id}`}
                onClick={() => loadServer(s.id)}
                onContextMenu={(e) => serverContext(s.id, e)}
                size="48px"
                src={s.avatar?.url ?? ""}
                fallback="/public/images/logos/no_shape_logo.png"
              />
            ))}
            <Icon
              onClick={joinServerButton}
              src="/public/icons/close.svg"
              size="32px"
            />
          </Column>
          <Column
            util={["no-shrink", "align-center"]}
            className="sy-accountarea"
          >
            <Icon
              src={client?.user?.avatar.url ?? ""}
              size="48px"
              onContextMenu={showUserAreaCtx}
            />
          </Column>
        </Column>
        <Column util={["no-shrink"]} className="sy-channelbar">
          <Column util={["flex-grow"]}>
            <Column
              util={["no-shrink", "justify-center"]}
              className="sy-topbar sy-servername"
            >
              {selectedServer?.name}
            </Column>
            <Column util={["flex-grow"]} className="sy-channellist">
              {channels.map((s) => (
                <Button
                  type="inherit"
                  style={combineStyles(
                    {
                      textAlign: "left",
                    },
                    selectedChannel?.id === s.id
                      ? {
                          backgroundColor:
                            "var(--dawn-control-hover-background)",
                        }
                      : null
                  )}
                  onClick={() => loadChannel(s.id)}
                >
                  {s.name}
                </Button>
              ))}
            </Column>
          </Column>
        </Column>
        <Column util={["flex-grow"]}>
          <Column util={["no-shrink", "justify-center"]} className="sy-topbar">
            {selectedChannel?.name}
          </Column>
          <div
            ref={messageAreaRef}
            className="sy-chatarea dawn-column flex-grow"
            style={{ padding: "10px" }}
          >
            {(messages || []).map((x) => (
              <MessageC message={x} />
            ))}
          </div>
          <Row util={["no-shrink"]} className="sy-messageinput">
            <textarea style={{ resize: "none" }} onKeyUp={handleKeyDown} />
          </Row>
        </Column>
      </Row>
    </FullPage>
  );
}

export default App;
