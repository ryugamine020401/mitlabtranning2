"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // 匯入 authSlice
import homeReducer from "./homeSlice"

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      home: homeReducer,
    },
    devTools: process.env.NODE_ENV !== "production", // 只有開發環境啟用 DevTools
  });
}
