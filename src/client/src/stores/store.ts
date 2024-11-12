import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { userSlice } from './userStore';

const store = configureStore({
    reducer: {
        users: userSlice.reducer
    }
});

export type RootUserState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootUserState> = useSelector
export default store;