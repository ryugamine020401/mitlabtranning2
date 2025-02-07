import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentView: "lists",   // 'lists' | 'profile' | 'set-profile' | 'profile-setpassword'
}


export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setView: (state, action) => {
      state.currentView = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("homeView", action.payload); // 存入 localStorage
      }
    },
  },
})

export const { setView } = homeSlice.actions
export default homeSlice.reducer

