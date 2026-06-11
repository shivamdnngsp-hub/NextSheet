import { configureStore } from "@reduxjs/toolkit";
import selectionReducer from "./slices/selectionSlice";
import presenceReducer from "./slices/presenceSlice"

export const store = configureStore({
  reducer: {
    selection: selectionReducer,
    presence : presenceReducer,
  },
});
