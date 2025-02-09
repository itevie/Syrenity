import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerAPIData } from "../syrenity-client/structures/Server";

const initialState: { [key: number]: ServerAPIData } = {};

export const serverSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
    addServers: (state, action: PayloadAction<ServerAPIData[]>) => {
      return {
        ...state,
        ...Object.fromEntries(action.payload.map((x) => [x.id, x])),
      };
    },
  },
});

export const { addServers } = serverSlice.actions;
