import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerAPIData } from "../syrenity-client/structures/Server";

const initialState: { [key: number]: ServerAPIData } = {};
type Payload = ["ADD", ServerAPIData[]] | ["REMOVE", number[]];

export const serverSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
    handleServers: (state, action: PayloadAction<Payload>) => {
      if (action.payload[0] === "ADD") {
        action.payload[1].forEach((server) => {
          state[server.id] = server;
        });
      } else if (action.payload[0] === "REMOVE") {
        const old = { ...state };
        for (const server of action.payload[1]) delete old[server];
        return { ...old };
      }
    },
  },
});

export const { handleServers } = serverSlice.actions;
