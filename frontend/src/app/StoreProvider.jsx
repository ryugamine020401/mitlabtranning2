"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../../store/store";

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = makeStore(); // 創建 Redux Store
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
