import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  cron: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
    startCron: (state) => {
      state.cron = true;
    },
    stopCron: (state) => {
      state.cron = false;
    },
  },
});

export const { login, logout, startCron, stopCron } = authSlice.actions;

export default authSlice.reducer;
