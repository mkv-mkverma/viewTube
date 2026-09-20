import { createSlice } from "@reduxjs/toolkit";

const initialState: Record<string, string[]> = {};

const cacheSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    cacheResult: (state, actions) => {
      return { ...state, ...actions.payload };
    },
  },
});

export const { cacheResult } = cacheSlice.actions;
export default cacheSlice.reducer;
