import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentView: "login",   // 'login' | 'forgot-password' | 'signup'
  isAuthenticated: false, //是否已登入
  user: null,             //用於存取用戶資料
}


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setView: (state, action) => {
      state.currentView = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("authView", action.payload); // 存入 localStorage
      }
    },
    setAuth: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
      //localStorage.setItem("user", JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.currentView = "login"
    },
  },
})

export const { setView, setAuth, logout } = authSlice.actions
export default authSlice.reducer

