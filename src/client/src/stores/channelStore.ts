import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServerAPIData } from "../syrenity-client/structures/Server";
import { ChannelAPIData } from "../syrenity-client/structures/Channel";

const initialState: { [key: number]: ChannelAPIData } = {};

export const channelSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    addChannels: (state, action: PayloadAction<ChannelAPIData[]>) => {
      return {
        ...state,
        ...Object.fromEntries(action.payload.map((x) => [x.id, x])),
      };
    },
  },
});

export const { addChannels } = channelSlice.actions;
