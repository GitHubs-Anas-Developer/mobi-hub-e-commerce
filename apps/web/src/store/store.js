import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  status: "initialized",
};

const appReducer = (state = initialState) => state;

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});
