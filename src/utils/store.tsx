import { configureStore } from "@reduxjs/toolkit";
import appReducers from "./appSlice";
import cacheReduces from "./cacheSlice";
const store = configureStore({
  reducer: {
    app: appReducers,
    search: cacheReduces,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
