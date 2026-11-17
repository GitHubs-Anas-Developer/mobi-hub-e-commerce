"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import AuthInitializer from "@/components/providers/AuthInitializer";
import BrandLoader from "@/components/providers/BrandLoader";

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <BrandLoader />
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
