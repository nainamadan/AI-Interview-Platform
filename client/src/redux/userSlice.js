import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  // loading: false,
  // error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers:
  // reducer chnage krta h intial state
  {
    // 🔐 set user after login
    setUser: (state, action) => {
      state.user = action.payload;
      // state.loading = false;
      // state.error = null;
    },

    // // 🚪 logout
    // clearUser: (state) => {
    //   state.user = null;
    //   state.loading = false;
    //   state.error = null;
    // },

    // // ⏳ loading state
    // setLoading: (state) => {
    //   state.loading = true;
    // },

    // // ❌ error
    // setError: (state, action) => {
    //   state.error = action.payload;
    //   state.loading = false;
    // },

//     // 💰 update credits
    updateCredits: (state, action) => {
      if (state.user) {
        state.user.credits = action.payload;
      }
    },
   },
 });

export const {
  setUser,
  // clearUser,
  // setLoading,
  // setError,
  updateCredits,
} = userSlice.actions;

export default userSlice.reducer;