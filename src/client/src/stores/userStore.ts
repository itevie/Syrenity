import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserAPIData } from "../syrenity-client/structures/User";

const initialState: { [key: number]: UserAPIData } = {};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<UserAPIData>) => {
      return {
        ...state,
        [action.payload.id]: action.payload,
      };
    },
  },
});

export const { addUser } = userSlice.actions;
