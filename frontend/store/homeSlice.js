import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentHomeView: "lists",   // 'lists' | 'profile' | 'set-profile' | 'profile-setpassword'
}


export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setHomeView: (state, action) => {
      state.currentHomeView = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("homeView", action.payload); // 存入 localStorage
      }
    },
  },
})

export const { setHomeView } = homeSlice.actions
export default homeSlice.reducer

