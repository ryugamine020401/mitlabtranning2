import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentView: "login", // 'login' | 'forgot-password' | 'signup'
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setView: (state, action) => {
      state.currentView = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("authView", action.payload); // 存入 localStorage
      }
    },
  },
});

export const { setView, setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
