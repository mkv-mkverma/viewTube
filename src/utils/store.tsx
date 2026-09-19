import { configureStore } from "@reduxjs/toolkit";
import appReducers from "./appSlice";
import cacheReduces from "./cacheSlice";
const store = configureStore({
  reducer: {
    app: appReducers,
    search: cacheReduces,
  },
});

export default store;
