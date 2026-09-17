import { configureStore } from "@reduxjs/toolkit";
import reducers from "./appSlice";
const store = configureStore({
  reducer: {
    app: reducers,
  },
});

export default store;
