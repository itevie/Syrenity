import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { userSlice } from "./userStore";
import { serverSlice } from "./serverStore";
import { channelSlice } from "./channelStore";

const store = configureStore({
  reducer: {
    users: userSlice.reducer,
    servers: serverSlice.reducer,
    channels: channelSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
